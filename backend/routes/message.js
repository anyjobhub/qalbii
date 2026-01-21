import express from 'express';
import multer from 'multer';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// @route   GET /api/message/:chatId
// @desc    Get all messages for a chat
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const messages = await Message.find({
            chat: chatId,
            deletedFor: { $ne: req.user._id },
            deletedForEveryone: false,
        })
            .populate('sender', 'username fullName profilePicture')
            .populate({
                path: 'replyTo',
                select: 'content sender createdAt media deletedForEveryone',
                populate: {
                    path: 'sender',
                    select: 'username fullName profilePicture',
                },
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Message.countDocuments({
            chat: chatId,
            deletedFor: { $ne: req.user._id },
            deletedForEveryone: false,
        });

        res.json({
            messages: messages.reverse(),
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/message/upload
// @desc    Upload media for message
// @access  Private
router.post('/upload', protect, upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { mediaType } = req.body; // 'image', 'video', or 'audio'

        let resourceType = 'auto';
        let folder = 'qalbi/media';

        if (mediaType === 'video') {
            resourceType = 'video';
            folder = 'qalbi/videos';
        } else if (mediaType === 'audio') {
            resourceType = 'video'; // Cloudinary uses 'video' for audio files
            folder = 'qalbi/audio';
        }

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Error uploading media' });
                }

                res.json({
                    url: result.secure_url,
                    type: mediaType,
                });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload media error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/message/:messageId
// @desc    Delete message (for self or both)
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { deleteFor } = req.body; // 'self' or 'both'

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify user is the sender
        if (!message.sender.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        if (deleteFor === 'both') {
            message.deletedForEveryone = true;
            await message.save();
        } else {
            // Delete for self
            if (!message.deletedFor.includes(req.user._id)) {
                message.deletedFor.push(req.user._id);
                await message.save();
            }
        }

        res.json({ message: 'Message deleted successfully', deleteFor });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
