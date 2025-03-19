import { useEffect, useCallback, useRef } from 'react';
import { useSettings } from './useSettings';

export function useHotkeys() {
  const { settings } = useSettings();
  const handlers = useRef(new Map());
  const combinations = useRef(new Set());

  // Default hotkey configurations
  const DEFAULT_HOTKEYS = {
    // Chat actions
    'ctrl+enter': 'sendMessage',
    'cmd+enter': 'sendMessage',
    'esc': 'clearInput',
    'ctrl+l': 'clearChat',
    'cmd+l': 'clearChat',

    // Navigation
    'ctrl+h': 'goHome',
    'cmd+h': 'goHome',
    'ctrl+d': 'goDashboard',
    'cmd+d': 'goDashboard',
    'ctrl+s': 'goSettings',
    'cmd+s': 'goSettings',

    // UI controls
    'ctrl+k': 'focusSearch',
    'cmd+k': 'focusSearch',
    'ctrl+/': 'showShortcuts',
    'cmd+/': 'showShortcuts',
    'ctrl+m': 'toggleSidebar',
    'cmd+m': 'toggleSidebar',

    // Model selection
    'alt+1': 'selectGPT4',
    'alt+2': 'selectGemini',
    'alt+3': 'selectClaude',
    'alt+4': 'selectDeepseek',

    // Accessibility
    'ctrl+plus': 'increaseFontSize',
    'cmd+plus': 'increaseFontSize',
    'ctrl+minus': 'decreaseFontSize',
    'cmd+minus': 'decreaseFontSize',
    'ctrl+0': 'resetFontSize',
    'cmd+0': 'resetFontSize'
  };

  // Parse key combination string
  const parseKeyCombination = useCallback((combination) => {
    const keys = combination.toLowerCase().split('+');
    return {
      ctrl: keys.includes('ctrl'),
      alt: keys.includes('alt'),
      shift: keys.includes('shift'),
      meta: keys.includes('cmd') || keys.includes('meta'),
      key: keys[keys.length - 1]
    };
  }, []);

  // Check if event matches key combination
  const matchesCombination = useCallback((event, combination) => {
    const { ctrl, alt, shift, meta, key } = parseKeyCombination(combination);
    return (
      event.ctrlKey === ctrl &&
      event.altKey === alt &&
      event.shiftKey === shift &&
      event.metaKey === meta &&
      event.key.toLowerCase() === key
    );
  }, [parseKeyCombination]);

  // Register a new hotkey handler
  const register = useCallback((combination, handler) => {
    if (typeof combination !== 'string') {
      throw new Error('Hotkey combination must be a string');
    }
    if (typeof handler !== 'function') {
      throw new Error('Hotkey handler must be a function');
    }

    handlers.current.set(combination, handler);
    combinations.current.add(combination);

    return () => {
      handlers.current.delete(combination);
      combinations.current.delete(combination);
    };
  }, []);

  // Unregister a hotkey handler
  const unregister = useCallback((combination) => {
    handlers.current.delete(combination);
    combinations.current.delete(combination);
  }, []);

  // Handle keydown events
  const handleKeyDown = useCallback((event) => {
    // Ignore if target is an input or textarea
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return;
    }

    // Check each registered combination
    for (const combination of combinations.current) {
      if (matchesCombination(event, combination)) {
        const handler = handlers.current.get(combination);
        if (handler) {
          event.preventDefault();
          handler(event);
          break;
        }
      }
    }
  }, [matchesCombination]);

  // Set up global event listener
  useEffect(() => {
    if (settings?.accessibility?.enableHotkeys === false) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, settings]);

  // Register multiple hotkeys at once
  const registerMany = useCallback((hotkeyMap) => {
    const unregisterFns = Object.entries(hotkeyMap).map(([combination, handler]) =>
      register(combination, handler)
    );

    return () => unregisterFns.forEach(fn => fn());
  }, [register]);

  // Get all registered hotkeys
  const getRegisteredHotkeys = useCallback(() => {
    return Array.from(handlers.current.entries()).map(([combination, handler]) => ({
      combination,
      handler
    }));
  }, []);

  // Check if a hotkey is registered
  const isRegistered = useCallback((combination) => {
    return handlers.current.has(combination);
  }, []);

  // Format key combination for display
  const formatKeyCombination = useCallback((combination) => {
    const isMac = typeof window !== 'undefined' && 
      /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

    return combination
      .split('+')
      .map(key => {
        switch (key.toLowerCase()) {
          case 'ctrl':
            return isMac ? '⌃' : 'Ctrl';
          case 'alt':
            return isMac ? '⌥' : 'Alt';
          case 'shift':
            return isMac ? '⇧' : 'Shift';
          case 'cmd':
          case 'meta':
            return isMac ? '⌘' : 'Win';
          default:
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
      })
      .join(' + ');
  }, []);

  return {
    register,
    unregister,
    registerMany,
    getRegisteredHotkeys,
    isRegistered,
    formatKeyCombination,
    DEFAULT_HOTKEYS
  };
}

export default useHotkeys;