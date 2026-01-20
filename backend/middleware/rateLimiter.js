import rateLimit from 'express-rate-limit';

// Rate limiter for signup
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: 'Too many signup attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many login attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for forgot password
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: 'Too many password reset attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for OTP verification
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many OTP verification attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for signup OTP
export const signupOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per 15 minutes per email
    message: 'Too many OTP requests for this email, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
