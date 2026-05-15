const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, "app.log");

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
  return `[${timestamp}] [${level}] ${message} ${metaStr}\n`;
};

const logger = {
  error: (message, meta = {}) => {
    const log = formatMessage("ERROR", message, meta);
    fs.appendFileSync(logFile, log);
  },
  warn: (message, meta = {}) => {
    const log = formatMessage("WARN", message, meta);
    fs.appendFileSync(logFile, log);
  },
  info: (message, meta = {}) => {
    const log = formatMessage("INFO", message, meta);
    fs.appendFileSync(logFile, log);
  },
};

module.exports = logger;