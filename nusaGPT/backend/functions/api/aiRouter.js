const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// AI Model token costs per 1000 tokens
const MODEL_COSTS = {
  'gpt4': 8,
  'gemini': 5,
  'claude': 6,
  'deepseek': 4
};

// Middleware to verify API key and check token balance
const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Query Firestore to find the user with this API key
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.where('apiKeys', 'array-contains', apiKey).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Check if user has sufficient tokens
    if (userData.totalTokens <= 0) {
      return res.status(402).json({ error: 'Insufficient tokens' });
    }

    // Attach user data to request
    req.user = {
      id: userDoc.id,
      ...userData
    };

    next();
  } catch (error) {
    console.error('API Key verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to calculate token cost
const calculateTokenCost = (model, tokenCount) => {
  const costPer1000 = MODEL_COSTS[model] || MODEL_COSTS['deepseek']; // Default to cheapest model
  return Math.ceil((tokenCount * costPer1000) / 1000);
};

// Helper function to update token balance
const updateTokenBalance = async (userId, tokensUsed) => {
  const userRef = admin.firestore().collection('users').doc(userId);
  
  await admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const newBalance = userDoc.data().totalTokens - tokensUsed;
    
    if (newBalance < 0) {
      throw new Error('Insufficient tokens');
    }
    
    transaction.update(userRef, { totalTokens: newBalance });
  });
};

// Helper function to log API usage
const logApiUsage = async (userId, apiKeyId, model, tokensUsed, request, response) => {
  await admin.firestore().collection('apiLogs').add({
    userId,
    apiKeyId,
    aiModel: model,
    tokensUsed,
    requestText: request,
    responseText: response,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    responseTime: Date.now() - req.startTime
  });
};

// Route to process AI requests
router.post('/chat', verifyApiKey, async (req, res) => {
  req.startTime = Date.now();
  
  try {
    const { model = 'deepseek', messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Estimate token count (simplified for example)
    const estimatedTokens = messages.reduce((acc, msg) => 
      acc + Math.ceil(msg.content.length / 4), 0);

    const tokenCost = calculateTokenCost(model, estimatedTokens);

    // Check if user has enough tokens
    if (req.user.totalTokens < tokenCost) {
      return res.status(402).json({ 
        error: 'Insufficient tokens',
        required: tokenCost,
        available: req.user.totalTokens
      });
    }

    // Process the request based on the model
    let response;
    switch(model) {
      case 'gpt4':
        // Implementation for GPT-4
        response = { text: "GPT-4 response simulation" };
        break;
      case 'gemini':
        // Implementation for Gemini
        response = { text: "Gemini response simulation" };
        break;
      case 'claude':
        // Implementation for Claude
        response = { text: "Claude response simulation" };
        break;
      case 'deepseek':
        // Implementation for DeepSeek
        response = { text: "DeepSeek response simulation" };
        break;
      default:
        return res.status(400).json({ error: 'Invalid model specified' });
    }

    // Update token balance
    await updateTokenBalance(req.user.id, tokenCost);

    // Log the API usage
    await logApiUsage(
      req.user.id,
      req.headers['x-api-key'],
      model,
      tokenCost,
      messages[messages.length - 1].content,
      response.text
    );

    // Return the response
    res.json({
      model,
      response: response.text,
      tokensUsed: tokenCost,
      remainingTokens: req.user.totalTokens - tokenCost
    });

  } catch (error) {
    console.error('AI Router error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get available models and their costs
router.get('/models', verifyApiKey, (req, res) => {
  res.json({
    models: {
      gpt4: {
        name: 'GPT-4',
        costPer1000Tokens: MODEL_COSTS.gpt4,
        description: 'Most capable GPT-4 model for various tasks'
      },
      gemini: {
        name: 'Gemini',
        costPer1000Tokens: MODEL_COSTS.gemini,
        description: 'Google\'s advanced language model'
      },
      claude: {
        name: 'Claude',
        costPer1000Tokens: MODEL_COSTS.claude,
        description: 'Anthropic\'s Claude model for detailed analysis'
      },
      deepseek: {
        name: 'DeepSeek',
        costPer1000Tokens: MODEL_COSTS.deepseek,
        description: 'Efficient model for general tasks'
      }
    }
  });
});

module.exports = router;