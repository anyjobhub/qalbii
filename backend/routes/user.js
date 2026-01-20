import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put(
    '/profile',
    protect,
    [
        body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
        body('mobile').optional().matches(/^[0-9]{10,15}$/).withMessage('Please provide a valid mobile number'),
        body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { fullName, mobile, password } = req.body;

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if mobile number is already taken
            if (mobile && mobile !== user.mobile) {
                const existingUser = await User.findOne({ mobile });
                if (existingUser) {
                    return res.status(400).json({ message: 'Mobile number already in use' });
                }
                user.mobile = mobile;
            }

            if (fullName) user.fullName = fullName;
            if (password) user.password = password;

            await user.save();

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    profilePicture: user.profilePicture,
                },
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   POST /api/user/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'qalbi/profile-pictures',
                transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Error uploading image' });
                }

                // Update user profile picture
                const user = await User.findById(req.user._id);
                user.profilePicture = result.secure_url;
                await user.save();

                res.json({
                    message: 'Profile picture uploaded successfully',
                    profilePicture: result.secure_url,
                });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/user/search
// @desc    Search users by username or full name
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length === 0) {
            return res.json({ users: [] });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } }, // Exclude current user
                {
                    $or: [
                        { username: { $regex: query, $options: 'i' } },
                        { fullName: { $regex: query, $options: 'i' } },
                    ],
                },
            ],
        })
            .select('username fullName profilePicture isOnline lastSeen')
            .limit(20);

        res.json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/user/all
// @desc    Get all users for discovery (excluding current user)
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user._id },
        })
            .select('username fullName profilePicture isOnline lastSeen')
            .limit(100)
            .sort({ fullName: 1 });

        res.json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
