import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useTokens() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [usage, setUsage] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [isLowBalance, setIsLowBalance] = useState(false);

  // API hooks
  const { execute: fetchBalance, isLoading: isLoadingBalance } = useApi(
    api.tokens.getBalance
  );
  const { execute: fetchUsage, isLoading: isLoadingUsage } = useApi(
    api.tokens.getUsage
  );
  const { execute: purchaseTokens, isLoading: isPurchasing } = useApi(
    api.tokens.purchase,
    {
      showSuccessToast: true,
      successMessage: 'Tokens purchased successfully'
    }
  );

  // Constants
  const LOW_BALANCE_THRESHOLD = 100;
  const TOKEN_PACKAGES = [
    { id: 'basic', amount: 1000, price: 10, bonus: 0 },
    { id: 'pro', amount: 5000, price: 45, bonus: 500 },
    { id: 'enterprise', amount: 10000, price: 80, bonus: 1500 }
  ];

  // Load balance
  const loadBalance = useCallback(async () => {
    if (!user) return;

    try {
      const { balance: newBalance } = await fetchBalance();
      setBalance(newBalance);
      setIsLowBalance(newBalance < LOW_BALANCE_THRESHOLD);

      if (newBalance < LOW_BALANCE_THRESHOLD) {
        addToast('Your token balance is running low', 'warning');
      }
    } catch (error) {
      console.error('Failed to load token balance:', error);
    }
  }, [user, fetchBalance, addToast]);

  // Load usage statistics
  const loadUsage = useCallback(async () => {
    if (!user) return;

    try {
      const [daily, weekly, monthly] = await Promise.all([
        fetchUsage(1),
        fetchUsage(7),
        fetchUsage(30)
      ]);

      setUsage({
        daily,
        weekly,
        monthly
      });
    } catch (error) {
      console.error('Failed to load token usage:', error);
    }
  }, [user, fetchUsage]);

  // Initial load
  useEffect(() => {
    loadBalance();
    loadUsage();
  }, [loadBalance, loadUsage]);

  // Purchase tokens
  const purchase = useCallback(async (packageId) => {
    const tokenPackage = TOKEN_PACKAGES.find(pkg => pkg.id === packageId);
    if (!tokenPackage) {
      throw new Error('Invalid package selected');
    }

    try {
      await purchaseTokens({
        amount: tokenPackage.amount,
        packageId
      });

      // Reload balance after purchase
      await loadBalance();
    } catch (error) {
      console.error('Failed to purchase tokens:', error);
      throw error;
    }
  }, [purchaseTokens, loadBalance]);

  // Calculate usage statistics
  const getUsageStats = useCallback(() => {
    const calculateAverage = (data) => {
      if (!data.length) return 0;
      const sum = data.reduce((acc, curr) => acc + curr.amount, 0);
      return sum / data.length;
    };

    const findPeakUsage = (data) => {
      if (!data.length) return { amount: 0, date: null };
      return data.reduce((max, curr) => 
        curr.amount > max.amount ? curr : max
      );
    };

    return {
      dailyAverage: calculateAverage(usage.daily),
      weeklyAverage: calculateAverage(usage.weekly),
      monthlyAverage: calculateAverage(usage.monthly),
      peakUsage: findPeakUsage([...usage.daily, ...usage.weekly, ...usage.monthly]),
      totalUsage: usage.monthly.reduce((sum, curr) => sum + curr.amount, 0)
    };
  }, [usage]);

  // Estimate remaining days based on average usage
  const estimateRemainingDays = useCallback(() => {
    const stats = getUsageStats();
    if (stats.dailyAverage === 0) return Infinity;
    return Math.floor(balance / stats.dailyAverage);
  }, [balance, getUsageStats]);

  // Get token cost for a specific model
  const getTokenCost = useCallback((model, messageLength) => {
    const costs = {
      gpt4: 0.08,
      gemini: 0.05,
      claude: 0.06,
      deepseek: 0.04
    };

    const tokensPerMessage = Math.ceil(messageLength / 4); // Rough estimate
    return tokensPerMessage * (costs[model] || costs.gpt4);
  }, []);

  return {
    balance,
    usage,
    isLowBalance,
    isLoadingBalance,
    isLoadingUsage,
    isPurchasing,
    TOKEN_PACKAGES,
    purchase,
    getUsageStats,
    estimateRemainingDays,
    getTokenCost,
    loadBalance,
    loadUsage
  };
}

export default useTokens;