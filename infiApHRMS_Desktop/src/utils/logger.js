const isDev = import.meta.env?.DEV || process.env.NODE_ENV === 'development';

export const logger = {
  error: (message, ...args) => {
    if (isDev) console.error(message, ...args);
  },
  warn: (message, ...args) => {
    if (isDev) console.warn(message, ...args);
  },
  info: (message, ...args) => {
    if (isDev) console.info(message, ...args);
  },
  log: (message, ...args) => {
    if (isDev) console.log(message, ...args);
  },
};

export default logger;