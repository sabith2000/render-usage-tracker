/**
 * Date helper utilities for DD-MM-YYYY format with IST timezone support.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30

/**
 * Get the current date in IST timezone.
 * @returns {Date} Date object adjusted to IST
 */
export function getNowIST() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + IST_OFFSET_MS);
}

/**
 * Check if a year is a leap year.
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get the number of days in a given month.
 * @param {number} month - 1-indexed (1 = January)
 * @param {number} year
 * @returns {number}
 */
export function getDaysInMonth(month, year) {
    if (month < 1 || month > 12) return 0;
    // Using JS Date trick: day 0 of next month = last day of current month
    return new Date(year, month, 0).getDate();
}

/**
 * Parse a DD-MM-YYYY date string to a Date object.
 * @param {string} dateStr - Date in DD-MM-YYYY format
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    const yyyy = parseInt(parts[2], 10);

    if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return null;
    if (mm < 1 || mm > 12) return null;
    if (dd < 1 || dd > getDaysInMonth(mm, yyyy)) return null;

    return new Date(yyyy, mm - 1, dd);
}

/**
 * Format a Date object to DD-MM-YYYY string.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
}

/**
 * Convert a DD-MM-YYYY string to a sortable YYYY-MM-DD string.
 * @param {string} dateStr
 * @returns {string}
 */
export function toSortableDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Check if a DD-MM-YYYY date string falls within a specific month and year.
 * @param {string} dateStr - DD-MM-YYYY
 * @param {number} month - 1-indexed
 * @param {number} year
 * @returns {boolean}
 */
export function isInMonth(dateStr, month, year) {
    const parsed = parseDate(dateStr);
    if (!parsed) return false;
    return parsed.getMonth() + 1 === month && parsed.getFullYear() === year;
}

/**
 * Check if a DD-MM-YYYY date string is a future date (in IST).
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isFutureDate(dateStr) {
    const parsed = parseDate(dateStr);
    if (!parsed) return false;

    const now = getNowIST();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

    return target > today;
}

/**
 * Get today's date formatted as DD-MM-YYYY in IST.
 * @returns {string}
 */
export function getTodayIST() {
    return formatDate(getNowIST());
}

/**
 * Extract month (1-indexed) and year from a DD-MM-YYYY string.
 * @param {string} dateStr
 * @returns {{ month: number, year: number } | null}
 */
export function getMonthYear(dateStr) {
    const parsed = parseDate(dateStr);
    if (!parsed) return null;
    return { month: parsed.getMonth() + 1, year: parsed.getFullYear() };
}

/**
 * Get all unique month/year combinations from a list of entries.
 * @param {Array<{ date: string }>} entries
 * @returns {Array<{ month: number, year: number, label: string }>}
 */
export function getAvailableMonths(entries) {
    const monthMap = new Map();

    for (const entry of entries) {
        const my = getMonthYear(entry.date);
        if (!my) continue;

        const key = `${my.year}-${String(my.month).padStart(2, '0')}`;
        if (!monthMap.has(key)) {
            const label = new Date(my.year, my.month - 1).toLocaleString('en-US', {
                month: 'long',
                year: 'numeric',
            });
            monthMap.set(key, { month: my.month, year: my.year, label });
        }
    }

    // Sort descending (most recent first)
    return Array.from(monthMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([, value]) => value);
}

/**
 * Calculate the number of calendar days between two DD-MM-YYYY date strings.
 * @param {string} dateStr1
 * @param {string} dateStr2
 * @returns {number} Absolute number of days
 */
export function daysBetween(dateStr1, dateStr2) {
    const d1 = parseDate(dateStr1);
    const d2 = parseDate(dateStr2);
    if (!d1 || !d2) return 0;

    const ms = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Month names for display purposes.
 */
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
