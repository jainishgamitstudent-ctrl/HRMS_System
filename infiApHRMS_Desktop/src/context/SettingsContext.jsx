import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { formatDate, formatDateTime, formatRelativeTime, formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { t, getTranslatedMonths } from '../utils/i18n';

const DEFAULT_CONFIG = {
  timezone: 'UTC +05:30 (Chennai, Kolkata, Mumbai)',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR (₹)',
  language: 'English (US)',
  sessionTimeout: '15 Minutes',
  mobilePush: true,
  hrAlerts: false,
  twoFactor: true,
  loginMonitor: true,
  systemLogs: true,
  maintenanceMode: false,
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('infiap_global_settings');
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_CONFIG;
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadSettings);

  // Listen for updates from other tabs/components
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'infiap_global_settings') {
        setSettings(loadSettings());
      }
    };
    const handleCustomEvent = () => {
      setSettings(loadSettings());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('infiap_settings_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('infiap_settings_updated', handleCustomEvent);
    };
  }, []);

  // Utility wrappers that automatically use current settings
  const fmtDate = useCallback(
    (dateInput) => formatDate(dateInput, settings),
    [settings]
  );
  const fmtDateTime = useCallback(
    (dateInput) => formatDateTime(dateInput, settings),
    [settings]
  );
  const fmtRelative = useCallback(
    (timestamp) => formatRelativeTime(timestamp, settings),
    [settings]
  );
  const fmtCurrency = useCallback(
    (value) => formatCurrency(value, settings),
    [settings]
  );
  const currencySymbol = useCallback(
    () => getCurrencySymbol(settings),
    [settings]
  );
  const translate = useCallback(
    (text) => t(text, settings.language),
    [settings.language]
  );
  const translatedMonths = useMemo(
    () => getTranslatedMonths(settings.language),
    [settings.language]
  );

  const updateSettings = useCallback((partial) => {
    const next = { ...settings, ...partial };
    localStorage.setItem('infiap_global_settings', JSON.stringify(next));
    setSettings(next);
    window.dispatchEvent(new Event('infiap_settings_updated'));
  }, [settings]);

  const contextValue = useMemo(
    () => ({
      settings,
      setSettings,
      updateSettings,
      formatDate: fmtDate,
      formatDateTime: fmtDateTime,
      formatRelativeTime: fmtRelative,
      formatCurrency: fmtCurrency,
      getCurrencySymbol: currencySymbol,
      t: translate,
      translatedMonths,
    }),
    [
      settings,
      updateSettings,
      fmtDate,
      fmtDateTime,
      fmtRelative,
      fmtCurrency,
      currencySymbol,
      translate,
      translatedMonths,
    ]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
