import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import {
  useApi,
  useForm,
  useChat,
  useSettings,
  useTokens,
  useSubscription,
  useAnalytics,
  useNotifications,
  useHotkeys,
  useTheme
} from '../';

// Mock providers wrapper
const AllTheProviders = ({ children }) => (
  <AuthProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AuthProvider>
);

describe('useApi', () => {
  const mockApiFunction = jest.fn();

  it('should handle successful API calls', async () => {
    mockApiFunction.mockResolvedValueOnce({ data: 'success' });

    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual({ data: 'success' });
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApiFunction.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Error expected
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });
});

describe('useForm', () => {
  const initialValues = { email: '', password: '' };

  it('should handle form values and changes', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' }
      });
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should handle form submission', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm(initialValues));

    await act(async () => {
      await result.current.handleSubmit(onSubmit)();
    });

    expect(onSubmit).toHaveBeenCalledWith(initialValues);
  });
});

describe('useChat', () => {
  it('should manage chat messages', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: AllTheProviders
    });

    act(() => {
      result.current.addMessage('Hello', 'user');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello');
  });

  it('should clear chat history', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: AllTheProviders
    });

    act(() => {
      result.current.addMessage('Hello', 'user');
      result.current.clearChat();
    });

    expect(result.current.messages).toHaveLength(0);
  });
});

describe('useSettings', () => {
  it('should manage user settings', async () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: AllTheProviders
    });

    await act(async () => {
      await result.current.updateSetting('theme', 'dark');
    });

    expect(result.current.settings.theme).toBe('dark');
  });
});

describe('useTokens', () => {
  it('should track token balance', async () => {
    const { result } = renderHook(() => useTokens(), {
      wrapper: AllTheProviders
    });

    await act(async () => {
      await result.current.loadBalance();
    });

    expect(result.current.balance).toBeDefined();
  });
});

describe('useHotkeys', () => {
  it('should register and handle hotkeys', () => {
    const handler = jest.fn();
    const { result } = renderHook(() => useHotkeys());

    act(() => {
      result.current.register('ctrl+s', handler);
    });

    // Simulate keydown event
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true
    });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });
});

describe('useTheme', () => {
  it('should manage theme changes', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: AllTheProviders
    });

    act(() => {
      result.current.changeTheme('dark');
    });

    expect(result.current.currentTheme).toBe('dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
  });
});

describe('Hook Combinations', () => {
  it('should combine chat with hotkeys', () => {
    const { result } = renderHook(() => {
      const chat = useChat();
      const { register } = useHotkeys();
      
      useEffect(() => {
        register('ctrl+enter', chat.sendMessage);
      }, [chat, register]);

      return chat;
    }, {
      wrapper: AllTheProviders
    });

    expect(result.current.sendMessage).toBeDefined();
  });

  it('should combine theme with settings', () => {
    const { result } = renderHook(() => {
      const theme = useTheme();
      const { settings } = useSettings();
      
      useEffect(() => {
        if (settings?.theme) {
          theme.changeTheme(settings.theme);
        }
      }, [settings?.theme, theme]);

      return { theme, settings };
    }, {
      wrapper: AllTheProviders
    });

    expect(result.current.theme.currentTheme).toBeDefined();
    expect(result.current.settings).toBeDefined();
  });
});

// Add more test cases as needed...