import express from 'express';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/chat
// @desc    Get all chats for the current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
            'deletedBy.user': { $ne: req.user._id },
        })
            .populate('participants', 'username fullName profilePicture isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                select: 'content sender createdAt status media',
            })
            .sort({ updatedAt: -1 });

        res.json({ chats });
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/chat/:id
// @desc    Get a specific chat by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: req.user._id,
        }).populate('participants', 'username fullName profilePicture isOnline lastSeen');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.json({ chat });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/chat
// @desc    Create or get existing chat
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ message: 'Participant ID is required' });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, participantId] },
        }).populate('participants', 'username fullName profilePicture isOnline lastSeen');

        if (chat) {
            // Remove from deletedBy if it was deleted (restore chat)
            const deletedIndex = chat.deletedBy.findIndex(
                (item) => item.user.toString() === req.user._id.toString()
            );

            if (deletedIndex !== -1) {
                chat.deletedBy.splice(deletedIndex, 1);
                await chat.save();
            }
            return res.json({ chat });
        }

        // Create new chat
        chat = await Chat.create({
            participants: [req.user._id, participantId],
        });

        chat = await Chat.findById(chat._id).populate('participants', 'username fullName profilePicture isOnline lastSeen');

        res.status(201).json({ chat });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/chat/:id
// @desc    Delete chat (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Add current user to deletedBy array with timestamp
        const alreadyDeleted = chat.deletedBy.some(
            (item) => item.user.toString() === req.user._id.toString()
        );

        if (!alreadyDeleted) {
            chat.deletedBy.push({
                user: req.user._id,
                deletedAt: new Date(),
            });
            await chat.save();

            // Mark all existing messages as deleted for this user
            await Message.updateMany(
                { chat: chat._id },
                { $addToSet: { deletedFor: req.user._id } }
            );
        }

        // If both participants deleted, optionally clean up (keep for now)
        // This ensures data is preserved even if both users delete
        // Uncomment below to permanently delete when both users delete:
        // if (chat.deletedBy.length === chat.participants.length) {
        //     await Message.deleteMany({ chat: chat._id });
        //     await Chat.deleteOne({ _id: chat._id });
        // }

        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
