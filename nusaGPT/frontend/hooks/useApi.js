import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import api, { handleApiError } from '../utils/api';

export function useApi(apiFunction, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    transformData = (data) => data,
    onSuccess = () => {},
    onError = () => {},
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      const transformedData = transformData(result);
      setData(transformedData);
      
      if (showSuccessToast) {
        addToast(successMessage, 'success');
      }
      
      onSuccess(transformedData);
      return transformedData;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      if (showErrorToast) {
        addToast(errorMessage, 'error');
      }
      
      onError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, showSuccessToast, showErrorToast, successMessage, transformData, onSuccess, onError, addToast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset
  };
}

// Example usage:
// const { data, error, isLoading, execute } = useApi(api.user.getProfile);
// const { data, error, isLoading, execute } = useApi(api.chat.sendMessage, {
//   showSuccessToast: true,
//   successMessage: 'Message sent successfully',
//   transformData: (data) => data.message,
//   onSuccess: (data) => {
//     // Handle success
//   },
//   onError: (error) => {
//     // Handle error
//   }
// });

// Specialized hooks for common operations
export function useAuth() {
  const login = useApi(api.auth.login, {
    showSuccessToast: true,
    successMessage: 'Logged in successfully'
  });

  const register = useApi(api.auth.register, {
    showSuccessToast: true,
    successMessage: 'Registration successful'
  });

  const resetPassword = useApi(api.auth.resetPassword, {
    showSuccessToast: true,
    successMessage: 'Password reset email sent'
  });

  return { login, register, resetPassword };
}

export function useChat() {
  const sendMessage = useApi(api.chat.sendMessage);
  const getHistory = useApi(api.chat.getHistory);
  const deleteHistory = useApi(api.chat.deleteHistory, {
    showSuccessToast: true,
    successMessage: 'Chat history cleared'
  });

  return { sendMessage, getHistory, deleteHistory };
}

export function useTokens() {
  const getBalance = useApi(api.tokens.getBalance);
  const getUsage = useApi(api.tokens.getUsage);
  const purchase = useApi(api.tokens.purchase, {
    showSuccessToast: true,
    successMessage: 'Tokens purchased successfully'
  });

  return { getBalance, getUsage, purchase };
}

export function useApiKeys() {
  const listKeys = useApi(api.apiKeys.list);
  const createKey = useApi(api.apiKeys.create, {
    showSuccessToast: true,
    successMessage: 'API key created successfully'
  });
  const revokeKey = useApi(api.apiKeys.revoke, {
    showSuccessToast: true,
    successMessage: 'API key revoked successfully'
  });

  return { listKeys, createKey, revokeKey };
}

export function useProfile() {
  const getProfile = useApi(api.user.getProfile);
  const updateProfile = useApi(api.user.updateProfile, {
    showSuccessToast: true,
    successMessage: 'Profile updated successfully'
  });
  const updateSettings = useApi(api.user.updateSettings, {
    showSuccessToast: true,
    successMessage: 'Settings updated successfully'
  });

  return { getProfile, updateProfile, updateSettings };
}

export function useSubscription() {
  const getCurrentPlan = useApi(api.subscription.getCurrentPlan);
  const upgrade = useApi(api.subscription.upgrade, {
    showSuccessToast: true,
    successMessage: 'Subscription upgraded successfully'
  });
  const cancel = useApi(api.subscription.cancel, {
    showSuccessToast: true,
    successMessage: 'Subscription cancelled successfully'
  });

  return { getCurrentPlan, upgrade, cancel };
}

export default useApi;