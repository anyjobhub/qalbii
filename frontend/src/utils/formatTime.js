import { format, isToday, isThisYear } from 'date-fns';

/**
 * Format a timestamp to exact time in local timezone
 * @param {string|Date} timestamp - UTC timestamp
 * @returns {string} Formatted time string
 * 
 * Examples:
 * - Today: "14:32"
 * - This year: "21 Jan, 14:32"
 * - Older: "21 Jan 2025, 14:32"
 */
export function formatExactTime(timestamp) {
    if (!timestamp) return '';

    try {
        const date = new Date(timestamp);

        // Check if valid date
        if (isNaN(date.getTime())) {
            return '';
        }

        // If today, show only time
        if (isToday(date)) {
            return format(date, 'HH:mm');
        }

        // If this year, show date without year
        if (isThisYear(date)) {
            return format(date, 'd MMM, HH:mm');
        }

        // Older dates, show full date
        return format(date, 'd MMM yyyy, HH:mm');
    } catch (error) {
        console.error('Error formatting time:', error);
        return '';
    }
}

/**
 * Format last seen status
 * @param {boolean} isOnline - Whether user is currently online
 * @param {string|Date} lastSeen - UTC timestamp of last seen
 * @returns {string} Display string
 * 
 * Examples:
 * - Online: "Online"
 * - Offline: "Last seen at 14:32"
 */
export function formatLastSeen(isOnline, lastSeen) {
    if (isOnline) {
        return 'Online';
    }

    const exactTime = formatExactTime(lastSeen);
    return exactTime ? `Last seen at ${exactTime}` : 'Offline';
}

/**
 * Format last seen for chat list (shorter version)
 * @param {boolean} isOnline - Whether user is currently online
 * @param {string|Date} lastSeen - UTC timestamp of last seen
 * @returns {string} Display string
 */
export function formatLastSeenShort(isOnline, lastSeen) {
    if (isOnline) {
        return 'Online';
    }

    return formatExactTime(lastSeen);
}
