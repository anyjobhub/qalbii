import { FiBell, FiBellOff, FiVolume2 } from 'react-icons/fi';
import useNotificationPreferences from '../hooks/useNotificationPreferences';
import useNotificationSound from '../hooks/useNotificationSound';

export default function NotificationSettings() {
    const preferences = useNotificationPreferences();
    const { testNotificationSound } = useNotificationSound(preferences);

    const handleVolumeChange = (e) => {
        const volume = parseFloat(e.target.value) / 100;
        preferences.setVolume(volume);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 w-72 sm:w-80 max-w-[90vw]">
            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <FiVolume2 className="text-primary-600" />
                Notification Settings
            </h3>

            {/* Sound Enable/Disable Toggle */}
            <div className="mb-3 sm:mb-4">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Sound Notifications
                    </span>
                    <button
                        onClick={preferences.toggleSound}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors touch-manipulation ${preferences.soundEnabled ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </label>
            </div>

            {/* Volume Control */}
            <div className={`mb-3 sm:mb-4 ${!preferences.soundEnabled ? 'opacity-50' : ''}`}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(preferences.volume * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(preferences.volume * 100)}
                    onChange={handleVolumeChange}
                    disabled={!preferences.soundEnabled}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 touch-manipulation"
                    style={{ minHeight: '44px' }}
                />
            </div>

            {/* Test Sound Button */}
            <button
                onClick={testNotificationSound}
                disabled={!preferences.soundEnabled}
                className="w-full py-3 px-4 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
            >
                <FiBell size={16} />
                Test Sound
            </button>
        </div>
    );
}
