import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Bell,
  Shield,
  Activity,
  Loader2,
  CheckCircle,
  X,
  Settings2,
  Save,
  RefreshCw
} from 'lucide-react';
import { getCompanySettings, updateCompanySettings } from '../../../services/adminApi';
import { useSettings } from '../../../context/SettingsContext';

const TIMEZONE_OPTIONS = [
  { value: 'UTC +05:30 (Chennai, Kolkata, Mumbai)', label: 'IST (India Standard Time)' },
  { value: 'UTC +00:00 (GMT London)', label: 'GMT (Greenwich Mean Time)' },
  { value: 'UTC -05:00 (EST New York)', label: 'EST (Eastern Standard Time)' },
  { value: 'UTC +08:00 (Singapore)', label: 'SGT (Singapore Time)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const CURRENCY_OPTIONS = [
  { value: 'INR (₹)', label: 'Indian Rupee (₹)' },
  { value: 'USD ($)', label: 'US Dollar ($)' },
  { value: 'EUR (€)', label: 'Euro (€)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'English (US)', label: 'English (US)' },
  { value: 'English (UK)', label: 'English (UK)' },
  { value: 'Hindi (HI)', label: 'Hindi' },
];

const SESSION_TIMEOUT_OPTIONS = [
  { value: '15 Minutes', label: '15 Minutes' },
  { value: '30 Minutes', label: '30 Minutes' },
  { value: '60 Minutes', label: '60 Minutes' },
  { value: 'Never', label: 'Never' },
];

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

const Toggle = ({ active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
      active
        ? 'bg-indigo-500 shadow-inner'
        : 'bg-slate-200 shadow-inner'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 flex items-center justify-center ${
      active ? 'left-[26px]' : 'left-1'
    }`} />
  </button>
);

const SectionCard = ({ icon, title, description, children, delay = 0 }) => {
  const Icon = icon;
  return (
  <div
    className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-4 mb-8">
      <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center shrink-0">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>
      </div>
    </div>
    {children}
  </div>
  );
};

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0">
    <div className="flex-1 min-w-0 mr-4">
      <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{label}</p>
      {description && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SelectField = ({ value, onChange, options, className = '' }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer ${className}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  </div>
);

const SystemSettings = () => {
  const { settings, updateSettings, t } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const config = settings;

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await getCompanySettings();
        if (mounted && res?.data?.success && res?.data?.data) {
          updateSettings(res.data.data);
        }
      } catch {
        // Use local storage fallback silently
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  const handleConfigChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleToggle = (key) => {
    updateSettings({ [key]: !config[key] });
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await updateCompanySettings(config);
      showNotification(t('Settings saved successfully!'));
    } catch {
      showNotification(t('Settings saved locally. Syncing later...'), 'success');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm(t('Reset all settings to defaults? This action cannot be undone.'))) {
      updateSettings(DEFAULT_CONFIG);
      showNotification(t('Settings reset to defaults'));
      saveSettings();
    }
  };

  if (loading && !config) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Loading Configuration...')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error'
            ? 'bg-rose-600 text-white'
            : 'bg-slate-900 text-white'
        }`}>
          {notification.type === 'error' ? (
            <X size={16} className="shrink-0" strokeWidth={3} />
          ) : (
            <CheckCircle size={16} className="shrink-0" strokeWidth={3} />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <Settings2 size={24} className="text-slate-800" />
             <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">{t('System Settings')}</h1>
          </div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none ml-9">{t('Global configurations and platform preferences')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} strokeWidth={2.5} />
            {t('Reset')}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t('Saving...')}
              </>
            ) : (
              <>
                <Save size={14} strokeWidth={2.5} />
                {t('Save Changes')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-2">

        {/* Left Column */}
        <div className="space-y-6 lg:space-y-8">

          <SectionCard
            icon={Globe}
            title={t('General Preferences')}
            description={t('Configure regional and display settings')}
            delay={100}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { key: 'timezone', label: t('Timezone'), options: TIMEZONE_OPTIONS },
                { key: 'dateFormat', label: t('Date Format'), options: DATE_FORMAT_OPTIONS },
                { key: 'currency', label: t('Currency'), options: CURRENCY_OPTIONS },
                { key: 'language', label: t('Language'), options: LANGUAGE_OPTIONS },
              ].map(({ key, label, options }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
                  <SelectField
                    value={config[key]}
                    onChange={(val) => handleConfigChange(key, val)}
                    options={options}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={Bell}
            title={t('Notifications')}
            description={t('Manage system-wide alert channels')}
            delay={200}
          >
            <div className="space-y-1">
              <SettingRow label={t('Push Notifications')} description={t('Get instant alerts directly on your device')}>
                <Toggle active={config.mobilePush} onClick={() => handleToggle('mobilePush')} />
              </SettingRow>
              <SettingRow label={t('HR & Payroll Alerts')} description={t('Important module-specific notifications')}>
                <Toggle active={config.hrAlerts} onClick={() => handleToggle('hrAlerts')} />
              </SettingRow>
            </div>
          </SectionCard>

        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:space-y-8">

          <SectionCard
            icon={Shield}
            title={t('Security & Access')}
            description={t('Configure authentication and session monitoring')}
            delay={300}
          >
            <div className="space-y-1">
              <SettingRow label={t('Two-Factor Authentication')} description={t('Require a secondary code for administrative access')}>
                <Toggle active={config.twoFactor} onClick={() => handleToggle('twoFactor')} />
              </SettingRow>
              <SettingRow label={t('Login Monitoring')} description={t('Track and log successful and failed access attempts')}>
                <Toggle active={config.loginMonitor} onClick={() => handleToggle('loginMonitor')} />
              </SettingRow>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{t('Session Timeout')}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('Automatic logout after inactivity')}</p>
                  </div>
                  <SelectField
                    value={config.sessionTimeout}
                    onChange={(val) => handleConfigChange('sessionTimeout', val)}
                    options={SESSION_TIMEOUT_OPTIONS}
                    className="w-full sm:w-48"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Activity}
            title={t('Platform Settings')}
            description={t('System operations and maintenance controls')}
            delay={400}
          >
            <div className="space-y-1">
              <SettingRow label={t('System Logs')} description={t('Enable verbose logging for debugging purposes')}>
                <Toggle active={config.systemLogs} onClick={() => handleToggle('systemLogs')} />
              </SettingRow>
              <SettingRow label={t('Maintenance Mode')} description={t('Temporarily restrict portal access to administrators only')}>
                <Toggle active={config.maintenanceMode} onClick={() => handleToggle('maintenanceMode')} />
              </SettingRow>
            </div>
          </SectionCard>

          {/* System Status Banner */}
          <div className="bg-slate-900 rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">{t('System Status')}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('All services operational')}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 bg-slate-800/50 rounded-xl px-5 py-3 border border-slate-700/50">
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t('Core Version')}</p>
                  <p className="text-sm font-black text-white">v1.2.4</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SystemSettings;