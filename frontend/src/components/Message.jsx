import { formatDistanceToNow } from 'date-fns';
import { FiCheck, FiCheckCircle, FiCornerUpLeft } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { useState } from 'react';
import ReplyPreview from './ReplyPreview';

export default function Message({ message, currentUserId, onDelete, onReply }) {
    const [showMenu, setShowMenu] = useState(false);
    const isSender = message.sender._id === currentUserId;

    const handleDelete = (deleteFor) => {
        onDelete(message._id, deleteFor);
        setShowMenu(false);
    };

    if (message.deletedForEveryone) {
        return (
            <div className="flex justify-center my-2">
                <span className="text-sm text-gray-400 italic">This message was deleted</span>
            </div>
        );
    }

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 group`}>
            <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isSender ? 'order-2' : 'order-1'}`}>
                {!isSender && (
                    <p className="text-xs text-gray-500 mb-1 ml-2">{message.sender.fullName}</p>
                )}

                <div className="relative">
                    <div
                        className={`rounded-2xl px-3 py-2 sm:px-4 text-sm sm:text-base ${isSender
                                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                    >
                        {/* Reply Preview */}
                        {message.replyTo && (
                            <ReplyPreview replyTo={message.replyTo} isInputPreview={false} />
                        )}
                        {/* Media */}
                        {message.media?.url && (
                            <div className="mb-2 max-w-full overflow-hidden">
                                {message.media.type === 'image' && (
                                    <img
                                        src={message.media.url}
                                        alt="Shared"
                                        className="rounded-lg max-w-full h-auto"
                                        style={{ maxHeight: '300px' }}
                                    />
                                )}
                                {message.media.type === 'video' && (
                                    <video
                                        src={message.media.url}
                                        controls
                                        className="rounded-lg max-w-full h-auto"
                                        style={{ maxHeight: '300px' }}
                                    />
                                )}
                                {message.media.type === 'audio' && (
                                    <audio src={message.media.url} controls className="w-full max-w-full" />
                                )}
                            </div>
                        )}

                        {/* Content */}
                        {message.content && <p className="break-words">{message.content}</p>}

                        {/* Timestamp and Status */}
                        <div className="flex items-center justify-end gap-2 mt-1">
                            <span
                                className={`text-xs ${isSender ? 'text-white/80' : 'text-gray-500'
                                    }`}
                            >
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>

                            {isSender && (
                                <span className="text-white/80">
                                    {message.status === 'sent' && <FiCheck size={14} />}
                                    {message.status === 'delivered' && (
                                        <span className="flex">
                                            <FiCheck size={14} className="-mr-2" />
                                            <FiCheck size={14} />
                                        </span>
                                    )}
                                    {message.status === 'read' && (
                                        <FiCheckCircle size={14} className="text-blue-300" />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Reply and Delete */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex gap-1">
                        {/* Reply Button - visible for everyone */}
                        {onReply && (
                            <button
                                onClick={() => onReply(message)}
                                className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-primary-50 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                                title="Reply to this message"
                            >
                                <FiCornerUpLeft className="text-primary-600" size={14} />
                            </button>
                        )}

                        {/* Delete Menu - only for sender */}
                        {isSender && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-100 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                                >
                                    <MdDelete className="text-red-500" size={14} />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border z-10 overflow-hidden min-w-[160px]">
                                        <button
                                            onClick={() => handleDelete('self')}
                                            className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 whitespace-nowrap touch-manipulation"
                                        >
                                            Delete for me
                                        </button>
                                        <button
                                            onClick={() => handleDelete('both')}
                                            className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 text-red-600 whitespace-nowrap touch-manipulation"
                                        >
                                            Delete for everyone
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
