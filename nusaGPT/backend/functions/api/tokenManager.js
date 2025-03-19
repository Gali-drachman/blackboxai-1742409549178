const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const functions = require('firebase-functions');

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

// Get user's token balance
router.get('/balance', verifyAuth, async (req, res) => {
  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      totalTokens: userData.totalTokens,
      subscriptionPlan: userData.subscriptionPlan
    });
  } catch (error) {
    console.error('Token balance check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get token usage history
router.get('/usage', verifyAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const usageLogs = await admin.firestore()
      .collection('apiLogs')
      .where('userId', '==', req.user.uid)
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'desc')
      .get();

    const usage = [];
    usageLogs.forEach(doc => {
      const data = doc.data();
      usage.push({
        id: doc.id,
        model: data.aiModel,
        tokensUsed: data.tokensUsed,
        timestamp: data.timestamp.toDate(),
        request: data.requestText.substring(0, 100) + '...' // Truncate for brevity
      });
    });

    res.json({ usage });
  } catch (error) {
    console.error('Token usage history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new API key
router.post('/api-key', verifyAuth, async (req, res) => {
  try {
    const apiKey = 'sk-' + Buffer.from(Math.random().toString()).toString('base64').substring(10, 30);
    
    const userRef = admin.firestore().collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const apiKeys = userData.apiKeys || [];
    
    // Limit the number of API keys per user
    if (apiKeys.length >= 5) {
      return res.status(400).json({ error: 'Maximum number of API keys reached' });
    }

    // Add new API key
    await userRef.update({
      apiKeys: admin.firestore.FieldValue.arrayUnion(apiKey)
    });

    res.json({ apiKey });
  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revoke API key
router.delete('/api-key/:key', verifyAuth, async (req, res) => {
  try {
    const { key } = req.params;
    
    const userRef = admin.firestore().collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove API key
    await userRef.update({
      apiKeys: admin.firestore.FieldValue.arrayRemove(key)
    });

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('API key revocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add tokens (for testing/admin purposes)
router.post('/add', verifyAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid token amount' });
    }

    const userRef = admin.firestore().collection('users').doc(req.user.uid);
    
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const newBalance = userDoc.data().totalTokens + amount;
      transaction.update(userRef, { totalTokens: newBalance });
    });

    res.json({ message: 'Tokens added successfully' });
  } catch (error) {
    console.error('Token addition error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get token pricing information
router.get('/pricing', async (req, res) => {
  try {
    res.json({
      models: {
        gpt4: {
          name: 'GPT-4',
          costPer1000Tokens: 8,
          description: 'Most capable GPT-4 model'
        },
        gemini: {
          name: 'Gemini',
          costPer1000Tokens: 5,
          description: 'Google\'s advanced language model'
        },
        claude: {
          name: 'Claude',
          costPer1000Tokens: 6,
          description: 'Anthropic\'s Claude model'
        },
        deepseek: {
          name: 'DeepSeek',
          costPer1000Tokens: 4,
          description: 'Efficient model for general tasks'
        }
      },
      subscriptionPlans: {
        free: {
          name: 'Free',
          tokens: 1000,
          price: 0,
          description: 'Start with 1000 free tokens'
        },
        basic: {
          name: 'Basic',
          tokens: 100000,
          price: 10,
          description: '100k tokens with all models'
        },
        pro: {
          name: 'Pro',
          tokens: 1000000,
          price: 50,
          description: '1M tokens with priority access'
        },
        unlimited: {
          name: 'Unlimited',
          tokens: null,
          price: 200,
          description: 'Unlimited tokens for enterprise use'
        }
      }
    });
  } catch (error) {
    console.error('Pricing info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;