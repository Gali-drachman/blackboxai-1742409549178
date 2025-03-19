import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export function useAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    usage: {
      daily: [],
      weekly: [],
      monthly: []
    },
    models: {
      gpt4: { requests: 0, tokens: 0 },
      gemini: { requests: 0, tokens: 0 },
      claude: { requests: 0, tokens: 0 },
      deepseek: { requests: 0, tokens: 0 }
    },
    performance: {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0
    },
    costs: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  });

  // API hooks
  const { execute: fetchAnalytics, isLoading } = useApi(
    api.analytics.getAnalytics
  );

  // Load analytics data
  const loadAnalytics = useCallback(async (period = 30) => {
    if (!user) return;

    try {
      const data = await fetchAnalytics({ period });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [user, fetchAnalytics]);

  // Initial load
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Calculate usage trends
  const getUsageTrends = useCallback(() => {
    const calculateTrend = (data) => {
      if (data.length < 2) return 0;
      const first = data[0].amount;
      const last = data[data.length - 1].amount;
      return ((last - first) / first) * 100;
    };

    return {
      daily: calculateTrend(analytics.usage.daily),
      weekly: calculateTrend(analytics.usage.weekly),
      monthly: calculateTrend(analytics.usage.monthly)
    };
  }, [analytics]);

  // Get model usage distribution
  const getModelDistribution = useCallback(() => {
    const total = Object.values(analytics.models).reduce(
      (sum, model) => sum + model.requests,
      0
    );

    return Object.entries(analytics.models).map(([model, data]) => ({
      model,
      percentage: total > 0 ? (data.requests / total) * 100 : 0,
      requests: data.requests,
      tokens: data.tokens
    }));
  }, [analytics]);

  // Calculate cost metrics
  const getCostMetrics = useCallback(() => {
    const { costs } = analytics;
    return {
      dailyAverage: costs.daily,
      weeklyAverage: costs.weekly / 7,
      monthlyAverage: costs.monthly / 30,
      projectedAnnual: costs.monthly * 12
    };
  }, [analytics]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const { performance } = analytics;
    return {
      averageResponseTime: performance.averageResponseTime,
      successRate: performance.successRate,
      errorRate: performance.errorRate,
      reliability: 100 - performance.errorRate
    };
  }, [analytics]);

  // Generate usage report
  const generateReport = useCallback(async (startDate, endDate) => {
    try {
      const report = await api.analytics.generateReport({
        startDate,
        endDate
      });
      return report;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }, []);

  // Get usage predictions
  const getUsagePredictions = useCallback(() => {
    const predictNextValue = (data) => {
      if (data.length < 2) return null;
      const values = data.map(d => d.amount);
      const average = values.reduce((a, b) => a + b) / values.length;
      const trend = (values[values.length - 1] - values[0]) / values.length;
      return average + trend;
    };

    return {
      nextDayPrediction: predictNextValue(analytics.usage.daily),
      nextWeekPrediction: predictNextValue(analytics.usage.weekly),
      nextMonthPrediction: predictNextValue(analytics.usage.monthly)
    };
  }, [analytics]);

  // Get usage anomalies
  const getUsageAnomalies = useCallback(() => {
    const detectAnomalies = (data) => {
      if (data.length < 3) return [];
      const values = data.map(d => d.amount);
      const mean = values.reduce((a, b) => a + b) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      );
      
      return data.filter(d => 
        Math.abs(d.amount - mean) > stdDev * 2
      );
    };

    return {
      daily: detectAnomalies(analytics.usage.daily),
      weekly: detectAnomalies(analytics.usage.weekly),
      monthly: detectAnomalies(analytics.usage.monthly)
    };
  }, [analytics]);

  return {
    analytics,
    isLoading,
    loadAnalytics,
    getUsageTrends,
    getModelDistribution,
    getCostMetrics,
    getPerformanceMetrics,
    generateReport,
    getUsagePredictions,
    getUsageAnomalies
  };
}

export default useAnalytics;