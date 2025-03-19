const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Import route handlers
const aiRouter = require('./api/aiRouter');
const tokenManager = require('./api/tokenManager');
const paymentRouter = require('./api/paymentRouter');

// API Routes
app.use('/ai', aiRouter);
app.use('/tokens', tokenManager);
app.use('/payment', paymentRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Export the Express API as a Firebase Function
exports.api = functions.https.onRequest(app);

// Auth Trigger (New User Signup)
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    // Create a user profile document with initial tokens
    await admin.firestore().collection('users').doc(user.uid).set({
      displayName: user.displayName || '',
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      totalTokens: 1000, // Initial free tokens
      subscriptionPlan: 'Free',
      apiKeys: [],
    });

    console.log(`Created new user profile for ${user.uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

// Scheduled token usage summary (runs daily)
exports.dailyTokenUsageSummary = functions.pubsub.schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const snapshot = await admin.firestore()
        .collection('apiLogs')
        .where('timestamp', '>=', yesterday)
        .get();

      const usageSummary = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!usageSummary[data.userId]) {
          usageSummary[data.userId] = {
            totalTokens: 0,
            requestCount: 0,
            modelUsage: {}
          };
        }
        
        usageSummary[data.userId].totalTokens += data.tokensUsed;
        usageSummary[data.userId].requestCount += 1;
        
        if (!usageSummary[data.userId].modelUsage[data.aiModel]) {
          usageSummary[data.userId].modelUsage[data.aiModel] = 0;
        }
        usageSummary[data.userId].modelUsage[data.aiModel] += data.tokensUsed;
      });

      // Store the summary
      const summaryDoc = {
        date: admin.firestore.FieldValue.serverTimestamp(),
        summary: usageSummary
      };

      await admin.firestore()
        .collection('usageSummaries')
        .add(summaryDoc);

      console.log('Daily token usage summary completed');
      return null;
    } catch (error) {
      console.error('Error generating daily token usage summary:', error);
      return null;
    }
  });