import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useSubscription() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // API hooks
  const { execute: fetchCurrentPlan, isLoading: isLoadingPlan } = useApi(
    api.subscription.getCurrentPlan
  );
  const { execute: upgradePlan, isLoading: isUpgrading } = useApi(
    api.subscription.upgrade,
    {
      showSuccessToast: true,
      successMessage: 'Subscription upgraded successfully'
    }
  );
  const { execute: cancelSubscription, isLoading: isCancelling } = useApi(
    api.subscription.cancel,
    {
      showSuccessToast: true,
      successMessage: 'Subscription cancelled successfully'
    }
  );

  // Subscription plans
  const SUBSCRIPTION_PLANS = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      tokens: 1000,
      features: [
        'Access to GPT-4',
        'Basic support',
        'Standard response time',
        'Community access'
      ],
      limitations: [
        'Limited to 50 requests per day',
        'Basic models only',
        'No API access'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29.99,
      tokens: 5000,
      features: [
        'Access to all AI models',
        'Priority support',
        'Faster response time',
        'API access',
        'Advanced analytics',
        'Team collaboration'
      ],
      limitations: [
        'Limited to 500 requests per day'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      tokens: 20000,
      features: [
        'Unlimited access to all models',
        '24/7 dedicated support',
        'Fastest response time',
        'Full API access',
        'Custom model training',
        'Advanced security features',
        'Team management',
        'Custom integrations'
      ],
      limitations: []
    }
  ];

  // Load current subscription
  const loadSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const currentPlan = await fetchCurrentPlan();
      setSubscription(currentPlan);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  }, [user, fetchCurrentPlan]);

  // Initial load
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Upgrade subscription
  const upgrade = useCallback(async (planId, paymentMethodId) => {
    try {
      await upgradePlan({
        planId,
        paymentMethodId
      });

      // Reload subscription after upgrade
      await loadSubscription();
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  }, [upgradePlan, loadSubscription]);

  // Cancel subscription
  const cancel = useCallback(async (reason) => {
    try {
      await cancelSubscription({ reason });
      await loadSubscription();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }, [cancelSubscription, loadSubscription]);

  // Check if feature is available in current plan
  const hasFeature = useCallback((featureId) => {
    if (!subscription) return false;
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    return plan?.features.some(f => f.toLowerCase().includes(featureId.toLowerCase()));
  }, [subscription]);

  // Get usage limits for current plan
  const getPlanLimits = useCallback(() => {
    if (!subscription) return null;
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    return {
      dailyRequests: plan.id === 'free' ? 50 : plan.id === 'pro' ? 500 : Infinity,
      tokensPerMonth: plan.tokens,
      modelAccess: plan.id === 'free' ? ['gpt4'] : ['gpt4', 'gemini', 'claude', 'deepseek'],
      apiAccess: plan.id !== 'free'
    };
  }, [subscription]);

  // Calculate days until renewal
  const getDaysUntilRenewal = useCallback(() => {
    if (!subscription?.renewalDate) return null;
    const renewal = new Date(subscription.renewalDate);
    const today = new Date();
    const diffTime = Math.abs(renewal - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [subscription]);

  // Check if eligible for upgrade
  const isEligibleForUpgrade = useCallback((targetPlanId) => {
    if (!subscription) return true;
    const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === targetPlanId);
    return currentPlan?.price < targetPlan?.price;
  }, [subscription]);

  return {
    subscription,
    isLoadingPlan,
    isUpgrading,
    isCancelling,
    SUBSCRIPTION_PLANS,
    upgrade,
    cancel,
    hasFeature,
    getPlanLimits,
    getDaysUntilRenewal,
    isEligibleForUpgrade,
    paymentMethods
  };
}

export default useSubscription;