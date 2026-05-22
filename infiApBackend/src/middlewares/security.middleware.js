const rateLimit = require("express-rate-limit");

const makeLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
      res.status(429).json({ message });
    },
  });

const generalLimiter = makeLimiter(
  60 * 1000,
  60,
  "Too many requests. Please try again later."
);

const authLimiter = makeLimiter(
  15 * 60 * 1000,
  100,
  "Too many authentication attempts. Please try again later."
);

const uploadLimiter = makeLimiter(
  60 * 1000,
  5,
  "Too many upload attempts. Please try again later."
);

const superadminOtpLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  "Too many OTP requests. Please try again later."
);

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  superadminOtpLimiter,
};