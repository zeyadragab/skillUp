import { body, validationResult } from 'express-validator';

// Validation error handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Email validation rules
export const validateEmail = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  validate
];

// OTP validation rules
export const validateOTP = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  validate
];

// Activation token validation
export const validateActivationToken = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Activation token is required')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid activation token format'),
  validate
];

// Resend activation email validation
export const validateResendActivation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  validate
];

// Sanitize input to prevent XSS
export const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags from all string inputs
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};
