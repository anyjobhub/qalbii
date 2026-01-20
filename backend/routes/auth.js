import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenGenerator.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { signupLimiter, loginLimiter, forgotPasswordLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
    '/signup',
    signupLimiter,
    [
        body('username')
            .trim()
            .isLength({ min: 3, max: 20 })
            .matches(/^[a-z0-9_]+$/)
            .withMessage('Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores'),
        body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
        body('mobile').matches(/^[0-9]{10,15}$/).withMessage('Please provide a valid mobile number'),
        body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, fullName, email, mobile, dateOfBirth, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ username }, { email }, { mobile }],
            });

            if (existingUser) {
                let message = 'User already exists';
                if (existingUser.username === username) message = 'Username already taken';
                else if (existingUser.email === email) message = 'Email already registered';
                else if (existingUser.mobile === mobile) message = 'Mobile number already registered';

                return res.status(400).json({ message });
            }

            // Create user
            const user = await User.create({
                username,
                fullName,
                email,
                mobile,
                dateOfBirth,
                password,
            });

            // Generate tokens
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    profilePicture: user.profilePicture,
                },
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Server error during signup' });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
    '/login',
    loginLimiter,
    [
        body('identifier').notEmpty().withMessage('Username, email, or mobile is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { identifier, password } = req.body;

            // Determine if identifier is email, mobile, or username
            let query = {};
            if (identifier.includes('@')) {
                query = { email: identifier.toLowerCase() };
            } else if (/^[0-9]{10,15}$/.test(identifier)) {
                query = { mobile: identifier };
            } else {
                query = { username: identifier.toLowerCase() };
            }

            // Find user and include password for comparison
            const user = await User.findOne(query).select('+password');

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate tokens
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    profilePicture: user.profilePicture,
                },
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post(
    '/forgot-password',
    forgotPasswordLimiter,
    [body('identifier').notEmpty().withMessage('Username, email, or mobile is required')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { identifier } = req.body;

            // Find user
            let query = {};
            if (identifier.includes('@')) {
                query = { email: identifier.toLowerCase() };
            } else if (/^[0-9]{10,15}$/.test(identifier)) {
                query = { mobile: identifier };
            } else {
                query = { username: identifier.toLowerCase() };
            }

            const user = await User.findOne(query);

            if (!user) {
                return res.status(404).json({ message: 'No account found with this information' });
            }

            // Generate 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Save OTP with error handling
            try {
                // Delete any existing OTP for this identifier
                await OTP.deleteMany({ identifier: identifier.toLowerCase() });

                // Create new OTP
                await OTP.create({
                    identifier: identifier.toLowerCase(),
                    otp: otpCode,
                });
            } catch (dbError) {
                console.error('❌ OTP DB Error:', dbError);
                return res.status(500).json({
                    message: 'Failed to generate OTP. Please try again.'
                });
            }

            // Send OTP via email with comprehensive error handling
            try {
                const emailResult = await sendOTPEmail(user.email, otpCode, user.username);

                if (!emailResult.success) {
                    console.error('❌ Email send failed:', emailResult.error);
                    return res.status(500).json({
                        message: 'Failed to send OTP email. Please check your email configuration.'
                    });
                }

                res.json({
                    message: 'OTP sent to your email',
                    identifier: identifier.toLowerCase(),
                });
            } catch (emailError) {
                console.error('❌ Email service error:', emailError.message || emailError);
                return res.status(500).json({
                    message: 'Email service temporarily unavailable. Please try again later.'
                });
            }
        } catch (error) {
            console.error('❌ Forgot password error:', error);
            res.status(500).json({
                message: 'Server error during password reset. Please try again.'
            });
        }
    }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post(
    '/verify-otp',
    otpLimiter,
    [
        body('identifier').notEmpty().withMessage('Identifier is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { identifier, otp } = req.body;

            // Find OTP record
            const otpRecord = await OTP.findOne({ identifier: identifier.toLowerCase() });

            if (!otpRecord) {
                return res.status(400).json({ message: 'OTP not found or expired' });
            }

            // Check if OTP is expired
            if (otpRecord.expiresAt < Date.now()) {
                await OTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({ message: 'OTP expired' });
            }

            // Check attempts
            if (otpRecord.attempts >= 5) {
                await OTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
            }

            // Verify OTP
            const isOTPValid = await otpRecord.compareOTP(otp);

            if (!isOTPValid) {
                otpRecord.attempts += 1;
                await otpRecord.save();
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            res.json({
                message: 'OTP verified successfully',
                verified: true,
            });
        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({ message: 'Server error during OTP verification' });
        }
    }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password after OTP verification
// @access  Public
router.post(
    '/reset-password',
    [
        body('identifier').notEmpty().withMessage('Identifier is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { identifier, otp, newPassword } = req.body;

            // Find OTP record
            const otpRecord = await OTP.findOne({ identifier: identifier.toLowerCase() });

            if (!otpRecord) {
                return res.status(400).json({ message: 'OTP not found or expired' });
            }

            // Verify OTP one more time
            const isOTPValid = await otpRecord.compareOTP(otp);

            if (!isOTPValid) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            // Find user
            let query = {};
            if (identifier.includes('@')) {
                query = { email: identifier.toLowerCase() };
            } else if (/^[0-9]{10,15}$/.test(identifier)) {
                query = { mobile: identifier };
            } else {
                query = { username: identifier.toLowerCase() };
            }

            const user = await User.findOne(query);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            // Delete OTP record
            await OTP.deleteOne({ _id: otpRecord._id });

            res.json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Server error during password reset' });
        }
    }
);

export default router;
