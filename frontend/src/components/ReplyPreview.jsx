import { FiX, FiImage, FiVideo, FiMusic } from 'react-icons/fi';

export default function ReplyPreview({ replyTo, isInputPreview = false, onClose }) {
    if (!replyTo) return null;

    // Handle deleted messages
    if (replyTo.deletedForEveryone) {
        return (
            <div
                className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${isInputPreview
                        ? 'bg-gray-100 border-gray-400'
                        : 'bg-gray-50 border-gray-300 mb-2'
                    }`}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">
                        {replyTo.sender?.fullName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-400 italic truncate">
                        This message was deleted
                    </p>
                </div>
                {isInputPreview && onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={18} />
                    </button>
                )}
            </div>
        );
    }

    // Get media icon if present
    const getMediaIcon = () => {
        if (!replyTo.media?.type) return null;

        switch (replyTo.media.type) {
            case 'image':
                return <FiImage className="text-primary-600" size={16} />;
            case 'video':
                return <FiVideo className="text-primary-600" size={16} />;
            case 'audio':
                return <FiMusic className="text-primary-600" size={16} />;
            default:
                return null;
        }
    };

    // Get display content
    const getDisplayContent = () => {
        if (replyTo.media?.type && !replyTo.content) {
            const typeNames = {
                image: 'Image',
                video: 'Video',
                audio: 'Audio',
            };
            return typeNames[replyTo.media.type] || 'Media';
        }

        if (replyTo.content) {
            const maxLength = 100;
            return replyTo.content.length > maxLength
                ? replyTo.content.substring(0, maxLength) + '...'
                : replyTo.content;
        }

        return 'Message';
    };

    const mediaIcon = getMediaIcon();
    const displayContent = getDisplayContent();

    return (
        <div
            className={`flex items-center gap-2 p-2 rounded-lg border-l-4 ${isInputPreview
                    ? 'bg-primary-50 border-primary-500'
                    : 'bg-gray-50 border-primary-400 mb-2'
                }`}
        >
            <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-600 font-medium">
                    {replyTo.sender?.fullName || 'Unknown'}
                </p>
                <div className="flex items-center gap-1">
                    {mediaIcon}
                    <p className="text-sm text-gray-600 truncate">{displayContent}</p>
                </div>
            </div>
            {isInputPreview && onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                >
                    <FiX size={18} />
                </button>
            )}
        </div>
    );
}
