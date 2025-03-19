import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Custom error class for API errors
class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }
}

// Helper to get auth token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

// Helper to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new APIError(
      data.error || 'An unexpected error occurred',
      data.code || 'unknown_error',
      response.status
    );
  }
  
  return data;
};

// Base API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) throw error;
    
    throw new APIError(
      'Network error occurred',
      'network_error',
      0
    );
  }
};

// API methods
export const api = {
  // Auth endpoints
  auth: {
    login: (email, password) => 
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
      
    register: (userData) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
      
    resetPassword: (email) =>
      apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
  },

  // Chat endpoints
  chat: {
    sendMessage: (message, model) =>
      apiRequest('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ message, model })
      }),
      
    getHistory: () =>
      apiRequest('/chat/history', {
        method: 'GET'
      }),
      
    deleteHistory: () =>
      apiRequest('/chat/history', {
        method: 'DELETE'
      })
  },

  // Token management endpoints
  tokens: {
    getBalance: () =>
      apiRequest('/tokens/balance', {
        method: 'GET'
      }),
      
    getUsage: (days = 7) =>
      apiRequest(`/tokens/usage?days=${days}`, {
        method: 'GET'
      }),
      
    purchase: (amount) =>
      apiRequest('/tokens/purchase', {
        method: 'POST',
        body: JSON.stringify({ amount })
      })
  },

  // API key management
  apiKeys: {
    list: () =>
      apiRequest('/api-keys', {
        method: 'GET'
      }),
      
    create: (name) =>
      apiRequest('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name })
      }),
      
    revoke: (keyId) =>
      apiRequest(`/api-keys/${keyId}`, {
        method: 'DELETE'
      })
  },

  // User management
  user: {
    getProfile: () =>
      apiRequest('/user/profile', {
        method: 'GET'
      }),
      
    updateProfile: (data) =>
      apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
      
    updateSettings: (settings) =>
      apiRequest('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
  },

  // Subscription management
  subscription: {
    getCurrentPlan: () =>
      apiRequest('/subscription/current', {
        method: 'GET'
      }),
      
    upgrade: (planId) =>
      apiRequest('/subscription/upgrade', {
        method: 'POST',
        body: JSON.stringify({ planId })
      }),
      
    cancel: () =>
      apiRequest('/subscription/cancel', {
        method: 'POST'
      })
  }
};

// Error handling helper
export const handleApiError = (error) => {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'auth_required':
        return 'Please log in to continue';
      case 'insufficient_tokens':
        return 'Insufficient tokens. Please purchase more tokens to continue';
      case 'invalid_api_key':
        return 'Invalid API key';
      case 'rate_limit_exceeded':
        return 'Rate limit exceeded. Please try again later';
      default:
        return error.message;
    }
  }
  
  return 'An unexpected error occurred. Please try again later';
};

export default api;