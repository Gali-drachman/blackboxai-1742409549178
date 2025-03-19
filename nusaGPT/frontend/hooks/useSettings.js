import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      tokenAlerts: true
    },
    chatPreferences: {
      fontSize: 'medium',
      messageAlignment: 'left',
      timestampFormat: '12h',
      codeBlockTheme: 'github',
      sendWithEnter: true
    },
    aiPreferences: {
      defaultModel: 'gpt4',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'normal'
    },
    privacy: {
      shareUsageData: true,
      storeHistory: true,
      autoDeleteHistory: 30 // days
    }
  });

  // API hooks
  const { execute: fetchSettings, isLoading: isLoadingSettings } = useApi(
    api.user.getSettings
  );
  const { execute: updateSettingsApi, isLoading: isUpdating } = useApi(
    api.user.updateSettings,
    {
      showSuccessToast: true,
      successMessage: 'Settings updated successfully'
    }
  );

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      const userSettings = await fetchSettings();
      setSettings(prev => ({
        ...prev,
        ...userSettings
      }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [user, fetchSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      await updateSettingsApi(newSettings);
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, [updateSettingsApi]);

  // Update a single setting
  const updateSetting = useCallback(async (key, value) => {
    const keys = key.split('.');
    const newSettings = { ...settings };
    let current = newSettings;

    // Navigate to the nested object
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    // Update the value
    current[keys[keys.length - 1]] = value;

    try {
      await updateSettings(newSettings);
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
      throw error;
    }
  }, [settings, updateSettings]);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      const defaultSettings = {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          tokenAlerts: true
        },
        chatPreferences: {
          fontSize: 'medium',
          messageAlignment: 'left',
          timestampFormat: '12h',
          codeBlockTheme: 'github',
          sendWithEnter: true
        },
        aiPreferences: {
          defaultModel: 'gpt4',
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          fontSize: 'normal'
        },
        privacy: {
          shareUsageData: true,
          storeHistory: true,
          autoDeleteHistory: 30
        }
      };

      await updateSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }, [updateSettings]);

  // Available options for settings
  const options = {
    themes: ['light', 'dark', 'system'],
    languages: ['en', 'id', 'es', 'fr', 'de', 'ja', 'ko', 'zh'],
    fontSizes: ['small', 'medium', 'large', 'x-large'],
    messageAlignments: ['left', 'right'],
    timestampFormats: ['12h', '24h'],
    codeBlockThemes: ['github', 'dracula', 'monokai', 'solarized'],
    aiModels: ['gpt4', 'gemini', 'claude', 'deepseek']
  };

  return {
    settings,
    isLoadingSettings,
    isUpdating,
    updateSettings,
    updateSetting,
    resetSettings,
    options
  };
}

export default useSettings;