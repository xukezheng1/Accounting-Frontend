import { useCallback, useEffect, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { EVENTS, subscribeEvent } from './events';
import { applyThemeUI, getThemePreference, resolveTheme, setThemePreference } from './theme';

export function useTheme() {
  const [preference, setPreferenceState] = useState(getThemePreference());
  const [theme, setThemeState] = useState(resolveTheme(preference));

  const syncTheme = useCallback(() => {
    const nextPreference = getThemePreference();
    const nextTheme = resolveTheme(nextPreference);
    setPreferenceState(nextPreference);
    setThemeState(nextTheme);
    applyThemeUI(nextTheme);
  }, []);

  useDidShow(() => {
    syncTheme();
  });

  useEffect(() => {
    const off = subscribeEvent(EVENTS.THEME_UPDATED, syncTheme);
    return () => off && off();
  }, [syncTheme]);

  const updatePreference = useCallback((nextPreference) => {
    const state = setThemePreference(nextPreference);
    applyThemeUI(state.theme);
    setPreferenceState(state.preference);
    setThemeState(state.theme);
  }, []);

  return {
    theme,
    preference,
    setPreference: updatePreference,
    isDark: theme === 'dark',
    themeClass: theme === 'dark' ? 'theme-dark' : 'theme-light'
  };
}
