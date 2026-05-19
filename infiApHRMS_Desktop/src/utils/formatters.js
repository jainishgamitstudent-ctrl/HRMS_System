/**
 * Global formatting utilities driven by user settings.
 * All functions accept a settings object (from useSettings) and format accordingly.
 */

const CURRENCY_MAP = {
  'INR (₹)': { symbol: '₹', locale: 'en-IN', code: 'INR' },
  'USD ($)': { symbol: '$', locale: 'en-US', code: 'USD' },
  'EUR (€)': { symbol: '€', locale: 'de-DE', code: 'EUR' },
};

const TIMEZONE_OFFSETS = {
  'UTC +05:30 (Chennai, Kolkata, Mumbai)': 330,
  'UTC +00:00 (GMT London)': 0,
  'UTC -05:00 (EST New York)': -300,
  'UTC +08:00 (Singapore)': 480,
};

/**
 * Get timezone offset in minutes from settings string.
 */
export const getTimezoneOffsetMinutes = (timezoneSetting) => {
  return TIMEZONE_OFFSETS[timezoneSetting] ?? 330;
};

/**
 * Convert a date to the selected timezone.
 */
export const toSelectedTimezone = (dateInput, timezoneSetting) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) return new Date();
  const offsetMinutes = getTimezoneOffsetMinutes(timezoneSetting);
  const localOffset = date.getTimezoneOffset();
  const diff = offsetMinutes + localOffset;
  return new Date(date.getTime() + diff * 60 * 1000);
};

/**
 * Format a date according to selected dateFormat and timezone.
 * dateInput: Date | string | number
 * settings: { dateFormat, timezone }
 */
export const formatDate = (dateInput, settings = {}) => {
  const { dateFormat = 'DD/MM/YYYY', timezone = 'UTC +05:30 (Chennai, Kolkata, Mumbai)' } = settings;
  const date = toSelectedTimezone(dateInput, timezone);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear());

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`;
    case 'YYYY-MM-DD':
      return `${y}-${m}-${d}`;
    case 'DD/MM/YYYY':
    default:
      return `${d}/${m}/${y}`;
  }
};

/**
 * Format a datetime with time included.
 */
export const formatDateTime = (dateInput, settings = {}) => {
  const { timezone = 'UTC +05:30 (Chennai, Kolkata, Mumbai)' } = settings;
  const date = toSelectedTimezone(dateInput, timezone);
  const dateStr = formatDate(date, settings);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Format relative time (e.g. "2h ago").
 */
export const formatRelativeTime = (timestamp, settings = {}) => {
  if (!timestamp) return '';
  const { language = 'English (US)' } = settings;
  const isHindi = language.includes('Hindi');

  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 60000);

  if (diff < 1) return isHindi ? 'अभी' : 'Just now';
  if (diff < 60) return `${diff}${isHindi ? 'म पहले' : 'm ago'}`;
  if (diff < 1440) return `${Math.floor(diff / 60)}${isHindi ? 'घं पहले' : 'h ago'}`;
  return `${Math.floor(diff / 1440)}${isHindi ? 'दिन पहले' : 'd ago'}`;
};

/**
 * Format currency according to selected currency setting.
 */
export const formatCurrency = (value, settings = {}) => {
  const { currency = 'INR (₹)' } = settings;
  const num = Number(value || 0);
  if (Number.isNaN(num)) return '₹0';

  const cfg = CURRENCY_MAP[currency] || CURRENCY_MAP['INR (₹)'];
  try {
    return `${cfg.symbol}${num.toLocaleString(cfg.locale)}`;
  } catch {
    return `${cfg.symbol}${num.toLocaleString('en-IN')}`;
  }
};

/**
 * Get currency symbol only.
 */
export const getCurrencySymbol = (settings = {}) => {
  const { currency = 'INR (₹)' } = settings;
  const cfg = CURRENCY_MAP[currency] || CURRENCY_MAP['INR (₹)'];
  return cfg.symbol;
};
