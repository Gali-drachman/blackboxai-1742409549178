import { useState, useCallback, useEffect } from 'react';
import { useSettings } from './useSettings';

export function useTheme() {
  const { settings, updateSetting } = useSettings();
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // Theme configurations
  const THEMES = {
    light: {
      name: 'Light',
      colors: {
        primary: '#4F46E5', // Indigo-600
        secondary: '#6B7280', // Gray-500
        background: '#FFFFFF',
        surface: '#F9FAFB', // Gray-50
        text: {
          primary: '#111827', // Gray-900
          secondary: '#4B5563', // Gray-600
          inverse: '#FFFFFF'
        },
        border: '#E5E7EB', // Gray-200
        divider: '#F3F4F6', // Gray-100
        error: '#DC2626', // Red-600
        success: '#059669', // Green-600
        warning: '#D97706', // Yellow-600
        info: '#2563EB' // Blue-600
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    },
    dark: {
      name: 'Dark',
      colors: {
        primary: '#6366F1', // Indigo-500
        secondary: '#9CA3AF', // Gray-400
        background: '#111827', // Gray-900
        surface: '#1F2937', // Gray-800
        text: {
          primary: '#F9FAFB', // Gray-50
          secondary: '#D1D5DB', // Gray-300
          inverse: '#111827' // Gray-900
        },
        border: '#374151', // Gray-700
        divider: '#2D3748', // Gray-800
        error: '#EF4444', // Red-500
        success: '#10B981', // Green-500
        warning: '#F59E0B', // Yellow-500
        info: '#3B82F6' // Blue-500
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
      }
    },
    system: {
      name: 'System',
      // Will use either light or dark based on system preference
    }
  };

  // CSS Variables map
  const CSS_VARIABLES = {
    '--color-primary': 'colors.primary',
    '--color-secondary': 'colors.secondary',
    '--color-background': 'colors.background',
    '--color-surface': 'colors.surface',
    '--color-text-primary': 'colors.text.primary',
    '--color-text-secondary': 'colors.text.secondary',
    '--color-text-inverse': 'colors.text.inverse',
    '--color-border': 'colors.border',
    '--color-divider': 'colors.divider',
    '--color-error': 'colors.error',
    '--color-success': 'colors.success',
    '--color-warning': 'colors.warning',
    '--color-info': 'colors.info',
    '--shadow-sm': 'shadows.sm',
    '--shadow-md': 'shadows.md',
    '--shadow-lg': 'shadows.lg'
  };

  // Get nested object value by path
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Apply theme to document
  const applyTheme = useCallback((themeName) => {
    const theme = THEMES[themeName];
    if (!theme) return;

    Object.entries(CSS_VARIABLES).forEach(([cssVar, themePath]) => {
      const value = getNestedValue(theme, themePath);
      if (value) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    });

    // Add theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeName}`);
  }, []);

  // Handle system theme change
  const handleSystemThemeChange = useCallback((e) => {
    if (isSystemTheme) {
      const newTheme = e.matches ? 'dark' : 'light';
      setCurrentTheme(newTheme);
      applyTheme(newTheme);
    }
  }, [isSystemTheme, applyTheme]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = settings?.theme || 'system';
    setIsSystemTheme(savedTheme === 'system');

    if (savedTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
      setCurrentTheme(systemDark.matches ? 'dark' : 'light');
      systemDark.addEventListener('change', handleSystemThemeChange);
      return () => systemDark.removeEventListener('change', handleSystemThemeChange);
    } else {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, [settings?.theme, handleSystemThemeChange, applyTheme]);

  // Change theme
  const changeTheme = useCallback(async (newTheme) => {
    if (!THEMES[newTheme]) return;

    try {
      await updateSetting('theme', newTheme);
      setIsSystemTheme(newTheme === 'system');

      if (newTheme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = systemDark.matches ? 'dark' : 'light';
        setCurrentTheme(systemTheme);
        applyTheme(systemTheme);
      } else {
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
      }
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  }, [updateSetting, applyTheme]);

  // Get current theme configuration
  const getThemeConfig = useCallback(() => {
    return THEMES[currentTheme];
  }, [currentTheme]);

  // Check if current theme is dark
  const isDarkTheme = useCallback(() => {
    return currentTheme === 'dark' || 
      (isSystemTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [currentTheme, isSystemTheme]);

  return {
    currentTheme,
    isSystemTheme,
    THEMES,
    changeTheme,
    getThemeConfig,
    isDarkTheme
  };
}

export default useTheme;