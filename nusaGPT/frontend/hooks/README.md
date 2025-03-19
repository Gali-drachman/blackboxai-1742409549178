# NusaGPT Custom React Hooks

A collection of custom React hooks for managing state, API calls, authentication, UI interactions, and more in the NusaGPT application.

## Core Hooks

### `useApi`
Manages API requests with automatic loading and error states.
```javascript
const { data, error, isLoading, execute } = useApi(apiFunction, {
  showSuccessToast: true,
  successMessage: 'Operation completed'
});
```

### `useForm`
Handles form state, validation, and submission.
```javascript
const { values, errors, handleChange, handleSubmit } = useForm(
  initialValues,
  validationSchema
);
```

### `useChat`
Manages chat interactions and message history.
```javascript
const { messages, sendMessage, clearChat } = useChat();
```

## User Management

### `useSettings`
Handles user settings and preferences.
```javascript
const { settings, updateSettings } = useSettings();
```

### `useTokens`
Manages token balance and usage.
```javascript
const { balance, purchase, getUsageStats } = useTokens();
```

### `useSubscription`
Handles subscription plans and payments.
```javascript
const { subscription, upgrade, cancel } = useSubscription();
```

## Analytics and Monitoring

### `useAnalytics`
Tracks user activity and generates reports.
```javascript
const { analytics, getUsageTrends } = useAnalytics();
```

### `useNotifications`
Manages real-time notifications.
```javascript
const { notifications, markAsRead } = useNotifications();
```

## UI and Interaction

### `useHotkeys`
Manages keyboard shortcuts.
```javascript
const { register, unregister } = useHotkeys();
```

### `useTheme`
Handles theme switching and customization.
```javascript
const { currentTheme, changeTheme } = useTheme();
```

## Combined Hooks

### `useChatWithHotkeys`
Combines chat functionality with keyboard shortcuts.
```javascript
const chat = useChatWithHotkeys();
```

### `useThemeWithSettings`
Combines theme management with user settings.
```javascript
const theme = useThemeWithSettings();
```

### `useNotificationsWithSound`
Adds sound effects to notifications.
```javascript
const notifications = useNotificationsWithSound();
```

## Hook Utilities

### `combineHooks`
Combines multiple hooks into a single hook.
```javascript
const combinedHook = combineHooks(useChat, useAnalytics);
```

### `createLoadingHook`
Creates a hook with automatic loading states.
```javascript
const hookWithLoading = createLoadingHook(useChat);
```

### `composeHooks`
Composes multiple hooks with shared props.
```javascript
const composedHook = composeHooks(useAuth, useChat, useAnalytics);
```

## Best Practices

1. **Error Handling**: Always use try-catch blocks when dealing with async operations.
```javascript
try {
  await sendMessage(text);
} catch (error) {
  console.error('Failed to send message:', error);
}
```

2. **Cleanup**: Clean up subscriptions and event listeners in useEffect.
```javascript
useEffect(() => {
  const unsubscribe = subscribeToNotifications();
  return () => unsubscribe();
}, []);
```

3. **Dependencies**: Keep hook dependencies minimal and explicit.
```javascript
useEffect(() => {
  // Effect logic
}, [necessary, dependencies, only]);
```

4. **State Updates**: Use functional updates for state that depends on previous state.
```javascript
setMessages(prev => [...prev, newMessage]);
```

## Performance Tips

1. **Memoization**: Use useMemo and useCallback for expensive computations and callbacks.
```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

2. **Debouncing**: Debounce frequent updates to prevent excessive re-renders.
```javascript
const debouncedSearch = useCallback(
  debounce(searchFunction, 300),
  []
);
```

3. **Batching**: Batch related state updates together.
```javascript
const updateUserProfile = () => {
  setName(newName);
  setEmail(newEmail);
  setAvatar(newAvatar);
};
```

## Contributing

When adding new hooks:
1. Follow the established naming convention
2. Include comprehensive documentation
3. Add tests for the hook
4. Update this README with usage examples

## License

MIT License - See LICENSE file for details