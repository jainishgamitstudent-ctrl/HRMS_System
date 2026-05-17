import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@hrms_theme';

export const lightColors = {
  background: '#f2f4f7',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  card: '#ffffff',
  cardBorder: '#e6e9ee',
  text: '#0f172a',
  textSecondary: '#1e293b',
  textMuted: '#64748b',
  primary: '#007AFF',
  primarySoft: '#EAF3FF',
  primaryBg: '#f8fbff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#eef2f7',
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  inputText: '#111827',
  inputPlaceholder: '#9ca3af',
  error: '#ef4444',
  success: '#22c55e',
  navBg: 'rgba(255, 255, 255, 0.95)',
  navBorder: 'rgba(255, 255, 255, 0.5)',
  navActive: '#007AFF',
  navInactive: '#94a3b8',
  overlay: 'rgba(15, 23, 42, 0.28)',
  shadow: '#000000',
  timelineDot: '#cbd5e1',
  timelineLine: '#e2e8f0',
  heroBg: '#eef5ff',
  heroBorder: '#cfe2ff',
  iconMuted: '#94a3b8',
};

export const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#334155',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f1f5f9',
  textSecondary: '#e2e8f0',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  primarySoft: '#1e3a8a',
  primaryBg: '#172554',
  border: '#334155',
  borderLight: '#1e293b',
  divider: '#334155',
  inputBg: '#1e293b',
  inputBorder: '#475569',
  inputText: '#f1f5f9',
  inputPlaceholder: '#64748b',
  error: '#f87171',
  success: '#4ade80',
  navBg: 'rgba(30, 41, 59, 0.95)',
  navBorder: 'rgba(51, 65, 85, 0.5)',
  navActive: '#3b82f6',
  navInactive: '#94a3b8',
  overlay: 'rgba(0, 0, 0, 0.55)',
  shadow: '#000000',
  timelineDot: '#475569',
  timelineLine: '#334155',
  heroBg: '#1e3a8a',
  heroBorder: '#3b82f6',
  iconMuted: '#64748b',
};

export type AppColors = typeof lightColors;

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          setThemeMode(stored);
          setIsDark(stored === 'dark');
        } else if (stored === 'system' || stored === null) {
          setThemeMode('system');
          setIsDark(systemColorScheme === 'dark');
        }
      } catch {
        setThemeMode('system');
        setIsDark(systemColorScheme === 'dark');
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const colors = useMemo<AppColors>(
    () => (isDark ? darkColors : lightColors),
    [isDark]
  );

  const toggleTheme = async () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const nextMode = nextDark ? 'dark' : 'light';
    setThemeMode(nextMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {}
  };

  const setTheme = async (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    const nextDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
    setIsDark(nextDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
