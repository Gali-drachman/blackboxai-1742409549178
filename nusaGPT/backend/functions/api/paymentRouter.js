const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);

// Middleware to verify user authentication
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Invalid authorization token' });
  }
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  basic: {
    tokens: 100000,
    price: 1000, // in cents
    name: 'Basic Plan'
  },
  pro: {
    tokens: 1000000,
    price: 5000, // in cents
    name: 'Pro Plan'
  },
  unlimited: {
    tokens: null,
    price: 20000, // in cents
    name: 'Unlimited Plan'
  }
};

// Create a payment intent for token purchase
router.post('/create-payment-intent', verifyAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: SUBSCRIPTION_PLANS[plan].price,
      currency: 'usd',
      metadata: {
        userId: req.user.uid,
        plan: plan
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Error creating payment intent' });
  }
});

// Handle successful payment webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      functions.config().stripe.webhook_secret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
  const { userId, plan } = paymentIntent.metadata;
  
  const userRef = admin.firestore().collection('users').doc(userId);
  
  try {
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const planDetails = SUBSCRIPTION_PLANS[plan];

      // Update user's subscription and tokens
      const updates = {
        subscriptionPlan: plan,
        subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Add tokens if plan includes them
      if (planDetails.tokens) {
        updates.totalTokens = (userData.totalTokens || 0) + planDetails.tokens;
      }

      transaction.update(userRef, updates);

      // Log the transaction
      const transactionLog = {
        userId,
        plan,
        amount: paymentIntent.amount,
        status: 'succeeded',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        paymentIntentId: paymentIntent.id
      };

      transaction.set(
        admin.firestore().collection('paymentLogs').doc(),
        transactionLog
      );
    });

    console.log(`Successfully processed payment for user ${userId}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    // You might want to implement a retry mechanism or alert an admin
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  const { userId, plan } = paymentIntent.metadata;
  
  try {
    // Log the failed payment
    await admin.firestore().collection('paymentLogs').add({
      userId,
      plan,
      amount: paymentIntent.amount,
      status: 'failed',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message
    });

    // Notify user about failed payment (you could implement email notification here)
    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    res.json({
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's payment history
router.get('/history', verifyAuth, async (req, res) => {
  try {
    const payments = await admin.firestore()
      .collection('paymentLogs')
      .where('userId', '==', req.user.uid)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const paymentHistory = [];
    payments.forEach(doc => {
      const data = doc.data();
      paymentHistory.push({
        id: doc.id,
        plan: data.plan,
        amount: data.amount,
        status: data.status,
        timestamp: data.timestamp.toDate(),
      });
    });

    res.json({ payments: paymentHistory });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', verifyAuth, async (req, res) => {
  try {
    const userRef = admin.firestore().collection('users').doc(req.user.uid);
    
    await userRef.update({
      subscriptionPlan: 'free',
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;