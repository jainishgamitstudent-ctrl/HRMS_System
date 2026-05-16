const { z } = require("zod");

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(254),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
  role: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(100),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(254),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6).max(100),
});

const verifyOTPSchema = z.object({
  email: z.string().email().max(254),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
};