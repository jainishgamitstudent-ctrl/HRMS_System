import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@hrms_theme';

export const lightColors = {
  background: '#f5f7fa',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  card: '#ffffff',
  cardBorder: '#f3f4f6',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  primary: '#007AFF',
  primaryBg: '#f8fbff',
  border: '#e5e7eb',
  borderLight: '#eef2f7',
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
};

interface ThemeContextType {
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== null) {
          setIsDark(stored === 'dark');
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch {
        setIsDark(systemColorScheme === 'dark');
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {}
  };

  const colors = lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
