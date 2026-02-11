import Taro from '@tarojs/taro';
import { EVENTS, dispatchEvent } from './events';

const THEME_STORAGE_KEY = 'ui:theme:preference';
const DEFAULT_PREFERENCE = 'system';

export const THEME_PREFERENCE = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
};

export function getThemePreference() {
  const value = Taro.getStorageSync(THEME_STORAGE_KEY);
  if (value === THEME_PREFERENCE.LIGHT || value === THEME_PREFERENCE.DARK || value === THEME_PREFERENCE.SYSTEM) {
    return value;
  }
  return DEFAULT_PREFERENCE;
}

export function getSystemTheme() {
  try {
    const info = Taro.getSystemInfoSync();
    return info?.theme === THEME_PREFERENCE.DARK ? THEME_PREFERENCE.DARK : THEME_PREFERENCE.LIGHT;
  } catch (error) {
    return THEME_PREFERENCE.LIGHT;
  }
}

export function resolveTheme(preference) {
  const picked = preference || getThemePreference();
  return picked === THEME_PREFERENCE.SYSTEM ? getSystemTheme() : picked;
}

function getThemePalette(theme) {
  const isDark = theme === THEME_PREFERENCE.DARK;
  return {
    navBg: isDark ? '#101317' : '#f7f7f8',
    navText: isDark ? '#ffffff' : '#000000',
    tabBg: isDark ? '#14181d' : '#ffffff',
    tabText: isDark ? '#8f96a3' : '#7b8088',
    tabSelected: isDark ? '#f2f4f7' : '#111111',
    tabBorder: isDark ? 'white' : 'black'
  };
}

export function applyThemeUI(theme) {
  const palette = getThemePalette(theme);
  const frontColor = palette.navText === '#ffffff' ? '#ffffff' : '#000000';

  try {
    Taro.setNavigationBarColor({
      frontColor,
      backgroundColor: palette.navBg,
      animation: {
        duration: 120,
        timingFunc: 'easeIn'
      }
    });
  } catch (error) {
    // Ignore unsupported platforms.
  }

  try {
    Taro.setTabBarStyle({
      backgroundColor: palette.tabBg,
      color: palette.tabText,
      selectedColor: palette.tabSelected,
      borderStyle: palette.tabBorder
    });
  } catch (error) {
    // Ignore unsupported platforms.
  }
}

export function setThemePreference(nextPreference) {
  const preference = nextPreference || DEFAULT_PREFERENCE;
  Taro.setStorageSync(THEME_STORAGE_KEY, preference);
  const theme = resolveTheme(preference);
  dispatchEvent(EVENTS.THEME_UPDATED, { preference, theme });
  return { preference, theme };
}
