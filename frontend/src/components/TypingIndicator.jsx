export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-full inline-flex">
            <div className="w-2 h-2 bg-primary-600 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full typing-dot"></div>
        </div>
    );
}
