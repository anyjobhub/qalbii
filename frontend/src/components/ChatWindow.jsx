import { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiTrash2, FiBell, FiArrowLeft } from 'react-icons/fi';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import NotificationSettings from './NotificationSettings';
import ReplyPreview from './ReplyPreview';
import { formatLastSeen } from '../utils/formatTime';
import api from '../utils/api';

export default function ChatWindow({
    chat,
    messages,
    currentUser,
    socket,
    onSendMessage,
    onDeleteMessage,
    onDeleteChat,
    onBack,
}) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const notificationSettingsRef = useRef(null);

    const otherUser = chat.participants.find((p) => p._id !== currentUser.id);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Socket listeners for typing
    useEffect(() => {
        if (!socket) return;

        const handleTypingStart = ({ userId, username }) => {
            if (userId !== currentUser.id) {
                setTypingUsers((prev) => new Set(prev).add(username));
            }
        };

        const handleTypingStop = ({ userId }) => {
            if (userId !== currentUser.id) {
                setTypingUsers((prev) => {
                    const newSet = new Set(prev);
                    // Remove by matching any username from this user
                    return newSet;
                });
                setTypingUsers(new Set());
            }
        };

        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);

        return () => {
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
        };
    }, [socket, currentUser.id]);

    // Close notification settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationSettingsRef.current &&
                !notificationSettingsRef.current.contains(event.target)
            ) {
                setShowNotificationSettings(false);
            }
        };

        if (showNotificationSettings) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationSettings]);

    const handleTyping = () => {
        if (!isTyping && socket) {
            setIsTyping(true);
            socket.emit('typing:start', {
                chatId: chat._id,
                userId: currentUser.id,
                username: currentUser.username,
            });
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket) {
                socket.emit('typing:stop', {
                    chatId: chat._id,
                    userId: currentUser.id,
                });
            }
        }, 1000);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        onSendMessage({
            content: newMessage,
            replyToId: replyToMessage?._id
        });
        setNewMessage('');
        setReplyToMessage(null); // Clear reply after sending

        // Stop typing indicator
        if (socket) {
            socket.emit('typing:stop', {
                chatId: chat._id,
                userId: currentUser.id,
            });
        }
        setIsTyping(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMedia(true);

        try {
            const formData = new FormData();
            formData.append('media', file);

            // Determine media type
            let mediaType = 'image';
            if (file.type.startsWith('video/')) mediaType = 'video';
            else if (file.type.startsWith('audio/')) mediaType = 'audio';

            formData.append('mediaType', mediaType);

            const response = await api.post('/message/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onSendMessage({
                media: response.data,
                replyToId: replyToMessage?._id
            });
            setReplyToMessage(null); // Clear reply after sending media
        } catch (error) {
            console.error('File upload error:', error);
            alert('Failed to upload file');
        }

        setUploadingMedia(false);
        e.target.value = '';
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Back Button - Mobile Only */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg touch-manipulation flex-shrink-0"
                            aria-label="Back to chats"
                        >
                            <FiArrowLeft size={20} className="text-gray-700" />
                        </button>
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {otherUser.profilePicture ? (
                                <img
                                    src={otherUser.profilePicture}
                                    alt={otherUser.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                otherUser.fullName?.charAt(0).toUpperCase()
                            )}
                        </div>
                        {otherUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </div>

                    {/* Name and Status */}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate">{otherUser.fullName}</h2>
                        <p className={`text-xs sm:text-sm truncate ${otherUser.isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {formatLastSeen(otherUser.isOnline, otherUser.lastSeen)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Notification Settings */}
                    <div className="relative" ref={notificationSettingsRef}>
                        <button
                            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                            className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 touch-manipulation"
                            title="Notification Settings"
                        >
                            <FiBell size={18} className="sm:w-5 sm:h-5" />
                        </button>

                        {showNotificationSettings && (
                            <div className="absolute right-0 top-12 z-50 max-w-[90vw] sm:max-w-none">
                                <NotificationSettings />
                            </div>
                        )}
                    </div>

                    {/* Delete Chat */}
                    <button
                        onClick={onDeleteChat}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 touch-manipulation"
                        title="Delete Chat"
                    >
                        <FiTrash2 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-purple-50/20">
                {messages.map((message) => (
                    <Message
                        key={message._id}
                        message={message}
                        currentUserId={currentUser.id}
                        onDelete={onDeleteMessage}
                        onReply={setReplyToMessage}
                    />
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="flex justify-start mb-4">
                        <TypingIndicator />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview Input Box */}
            {replyToMessage && (
                <div className="px-4 py-2 bg-gray-50 border-t">
                    <ReplyPreview
                        replyTo={replyToMessage}
                        isInputPreview={true}
                        onClose={() => setReplyToMessage(null)}
                    />
                </div>
            )}

            {/* Input Area */}
            <div className="p-2 sm:p-4 border-t bg-white">
                <div className="flex items-end gap-1 sm:gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,video/*,audio/*"
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingMedia}
                        className="p-2 sm:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 touch-manipulation flex-shrink-0"
                        title="Attach Media"
                    >
                        <FiImage size={18} className="sm:w-5 sm:h-5" />
                    </button>

                    <textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-200 focus:border-primary-500 outline-none resize-none"
                        placeholder="Type a message..."
                        rows="1"
                        style={{ maxHeight: '100px' }}
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || uploadingMedia}
                        className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
                        title="Send Message"
                    >
                        <FiSend size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
