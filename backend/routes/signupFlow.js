import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import SignupOTP from '../models/SignupOTP.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { signupOTPLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/auth/send-signup-otp
// @desc    Send OTP for email verification during signup
// @access  Public
router.post(
    '/send-signup-otp',
    signupOTPLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email } = req.body;

            // Check if email already registered
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered. Please login.' });
            }

            // Generate 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Delete any existing OTP for this email
            await SignupOTP.deleteMany({ email });

            // Save OTP
            await SignupOTP.create({
                email,
                otp: otpCode,
            });

            // Send OTP via email
            const emailResult = await sendOTPEmail(email, otpCode, 'User');

            if (!emailResult.success) {
                return res.status(500).json({
                    message: 'Failed to send OTP email. Please try again.'
                });
            }

            res.json({
                message: 'OTP sent to your email',
                email,
            });
        } catch (error) {
            console.error('Send signup OTP error:', error);
            res.status(500).json({ message: 'Server error. Please try again.' });
        }
    }
);

// @route   POST /api/auth/verify-signup-otp
// @desc    Verify OTP for signup
// @access  Public
router.post(
    '/verify-signup-otp',
    [
        body('email').isEmail().normalizeEmail().withMessage('Email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, otp } = req.body;

            // Find OTP record
            const otpRecord = await SignupOTP.findOne({ email });

            if (!otpRecord) {
                return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
            }

            // Check if OTP is expired
            if (otpRecord.expiresAt < Date.now()) {
                await SignupOTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            }

            // Check attempts
            if (otpRecord.attempts >= 3) {
                await SignupOTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({
                    message: 'Too many incorrect attempts. Please request a new OTP.'
                });
            }

            // Verify OTP
            const isOTPValid = await otpRecord.compareOTP(otp);

            if (!isOTPValid) {
                otpRecord.attempts += 1;
                await otpRecord.save();
                const attemptsLeft = 3 - otpRecord.attempts;
                return res.status(400).json({
                    message: `Invalid OTP. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.`
                });
            }

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            otpRecord.verified = true;
            otpRecord.verificationToken = verificationToken;
            await otpRecord.save();

            res.json({
                message: 'Email verified successfully',
                verificationToken,
            });
        } catch (error) {
            console.error('Verify signup OTP error:', error);
            res.status(500).json({ message: 'Server error. Please try again.' });
        }
    }
);

// @route   POST /api/auth/complete-signup
// @desc    Complete signup after email verification
// @access  Public
router.post(
    '/complete-signup',
    [
        body('email').isEmail().normalizeEmail(),
        body('verificationToken').notEmpty().withMessage('Verification token required'),
        body('username')
            .trim()
            .isLength({ min: 3, max: 20 })
            .matches(/^[a-z0-9_]+$/)
            .withMessage('Username must be 3-20 characters, lowercase letters, numbers, and underscores only'),
        body('fullName').trim().isLength({ min: 2 }).withMessage('Full name required'),
        body('mobile').matches(/^[0-9]{10,15}$/).withMessage('Valid mobile number required'),
        body('dateOfBirth').isISO8601().withMessage('Valid date of birth required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, verificationToken, username, fullName, mobile, dateOfBirth, password } = req.body;

            // Verify email was verified
            const otpRecord = await SignupOTP.findOne({
                email,
                verified: true,
                verificationToken
            });

            if (!otpRecord) {
                return res.status(400).json({
                    message: 'Email verification expired or invalid. Please start over.'
                });
            }

            // Check if verification token expired (15 minutes after verification)
            const fifteenMinutes = 15 * 60 * 1000;
            if (Date.now() - otpRecord.updatedAt.getTime() > fifteenMinutes) {
                await SignupOTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({
                    message: 'Verification expired. Please start signup again.'
                });
            }

            // Check for duplicate username or mobile
            const existingUser = await User.findOne({
                $or: [{ username }, { mobile }],
            });

            if (existingUser) {
                let message = 'User already exists';
                if (existingUser.username === username) {
                    message = 'Username already taken';
                } else if (existingUser.mobile === mobile) {
                    message = 'Mobile number already registered';
                }
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
                emailVerified: true, // Email already verified via OTP
            });

            // Delete OTP record
            await SignupOTP.deleteOne({ _id: otpRecord._id });

            res.status(201).json({
                message: 'Account created successfully! Please login.',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error('Complete signup error:', error);
            res.status(500).json({ message: 'Server error during signup. Please try again.' });
        }
    }
);

export default router;
