// API and Data Management
export { default as useApi } from './useApi';
export { default as useForm } from './useForm';
export { default as useChat } from './useChat';

// User Management
export { default as useSettings } from './useSettings';
export { default as useTokens } from './useTokens';
export { default as useSubscription } from './useSubscription';
export { default as useAnalytics } from './useAnalytics';
export { default as useNotifications } from './useNotifications';

// UI and Interaction
export { default as useHotkeys } from './useHotkeys';
export { default as useTheme } from './useTheme';

// Hook Combinations
export function useChatWithHotkeys() {
  const chat = useChat();
  const { register } = useHotkeys();

  useEffect(() => {
    // Register chat-specific hotkeys
    return register('ctrl+enter', () => chat.sendMessage());
  }, [chat, register]);

  return chat;
}

export function useThemeWithSettings() {
  const theme = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.accessibility?.highContrast) {
      // Apply high contrast modifications to theme
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings?.accessibility?.highContrast]);

  return theme;
}

export function useNotificationsWithSound() {
  const notifications = useNotifications();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.notifications?.sound) {
      // Enable notification sounds
      document.documentElement.classList.add('notifications-sound');
    } else {
      document.documentElement.classList.remove('notifications-sound');
    }
  }, [settings?.notifications?.sound]);

  return notifications;
}

// Utility function to combine multiple hooks
export function combineHooks(...hooks) {
  return (...args) => {
    return hooks.reduce((acc, hook) => ({
      ...acc,
      ...hook(...args)
    }), {});
  };
}

// Example combined hooks
export const useChatWithAnalytics = combineHooks(useChat, useAnalytics);
export const useSettingsWithTheme = combineHooks(useSettings, useTheme);
export const useTokensWithNotifications = combineHooks(useTokens, useNotifications);

// Hook factory for creating hooks with automatic loading states
export function createLoadingHook(hook) {
  return (...args) => {
    const [isLoading, setIsLoading] = useState(false);
    const hookResult = hook(...args);

    const wrapWithLoading = (fn) => {
      return async (...args) => {
        setIsLoading(true);
        try {
          const result = await fn(...args);
          return result;
        } finally {
          setIsLoading(false);
        }
      };
    };

    // Wrap all functions in the hook result with loading state
    const wrappedHook = Object.entries(hookResult).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'function' ? wrapWithLoading(value) : value;
      return acc;
    }, {});

    return {
      ...wrappedHook,
      isLoading
    };
  };
}

// Example usage of hook factory
export const useChatWithLoading = createLoadingHook(useChat);
export const useTokensWithLoading = createLoadingHook(useTokens);
export const useAnalyticsWithLoading = createLoadingHook(useAnalytics);

// Hook composition utilities
export const composeHooks = (...hooks) => {
  return (initialProps = {}) =>
    hooks.reduce((props, hook) => ({
      ...props,
      ...hook(props)
    }), initialProps);
};

// Example composed hooks
export const useAuthenticatedChat = composeHooks(
  useAuth,
  useChat,
  useAnalytics
);

export const useAuthenticatedSettings = composeHooks(
  useAuth,
  useSettings,
  useTheme
);

// Export all hook names for documentation
export const AVAILABLE_HOOKS = [
  'useApi',
  'useForm',
  'useChat',
  'useSettings',
  'useTokens',
  'useSubscription',
  'useAnalytics',
  'useNotifications',
  'useHotkeys',
  'useTheme',
  'useChatWithHotkeys',
  'useThemeWithSettings',
  'useNotificationsWithSound',
  'useChatWithAnalytics',
  'useSettingsWithTheme',
  'useTokensWithNotifications',
  'useChatWithLoading',
  'useTokensWithLoading',
  'useAnalyticsWithLoading',
  'useAuthenticatedChat',
  'useAuthenticatedSettings'
];