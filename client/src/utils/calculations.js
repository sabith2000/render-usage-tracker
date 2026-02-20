/**
 * Calculation utilities for Render usage monitoring.
 * All functions are defensive against NaN, undefined, and division by zero.
 */

import { isInMonth, daysBetween, getDaysInMonth } from './dateHelpers.js';

/** Monthly free hour limit on Render */
export const FREE_HOUR_LIMIT = 750;

/**
 * Compute daily increase values for a sorted array of entries.
 * First entry gets "-", others get the difference from prior entry.
 *
 * @param {Array<{ date: string, totalHours: number }>} entries - Sorted chronologically
 * @returns {Array<{ ...entry, dailyIncrease: string|number, isInvalid: boolean }>}
 */
export function computeDailyIncrease(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return [];

    return entries.map((entry, index) => {
        if (index === 0) {
            return { ...entry, dailyIncrease: '-', isInvalid: false };
        }

        const prev = entries[index - 1];
        const diff = Number(entry.totalHours) - Number(prev.totalHours);
        const safeDiff = isNaN(diff) ? 0 : diff;

        return {
            ...entry,
            dailyIncrease: safeDiff,
            isInvalid: safeDiff < 0,
        };
    });
}

/**
 * Check if any entry in the list has an invalid (negative) daily increase.
 *
 * @param {Array<{ isInvalid?: boolean }>} entriesWithIncrease
 * @returns {boolean}
 */
export function hasInvalidData(entriesWithIncrease) {
    return entriesWithIncrease.some((e) => e.isInvalid === true);
}

/**
 * Compute monthly statistics for a given month from a sorted entry list.
 *
 * @param {Array<{ date: string, totalHours: number }>} allEntries - All entries sorted chronologically
 * @param {number} month - 1-indexed month
 * @param {number} year
 * @returns {{
 *   entries: Array,
 *   entriesWithIncrease: Array,
 *   firstTotal: number|null,
 *   latestTotal: number|null,
 *   firstDate: string|null,
 *   latestDate: string|null,
 *   daysBetween: number,
 *   avgPerDay: number,
 *   projectedTotal: number,
 *   remainingHours: number,
 *   daysInMonth: number,
 *   entryCount: number,
 *   hasInvalidData: boolean,
 *   status: 'SAFE'|'DANGER'|'WAITING'|'INVALID DATA',
 * }}
 */
export function computeMonthlyStats(allEntries, month, year) {
    const daysInMonth = getDaysInMonth(month, year);

    // Filter entries for the selected month
    const monthEntries = (allEntries || []).filter((e) => isInMonth(e.date, month, year));

    // Compute daily increase
    const entriesWithIncrease = computeDailyIncrease(monthEntries);
    const invalidDetected = hasInvalidData(entriesWithIncrease);

    const hasData = monthEntries.length > 0;
    const count = monthEntries.length;

    // Basic stats derived even from single entry
    const first = hasData ? monthEntries[0] : null;
    const latest = hasData ? monthEntries[count - 1] : null; // Same as first if count=1

    const firstTotal = first ? safeNumber(first.totalHours) : 0;
    const latestTotal = latest ? safeNumber(latest.totalHours) : 0;

    // Progress % based on latest total
    const progressPercentage = safeFixed((latestTotal / FREE_HOUR_LIMIT) * 100, 1);

    // Default status
    let status = 'WAITING';
    if (invalidDetected) status = 'INVALID DATA';
    else if (latestTotal >= FREE_HOUR_LIMIT) status = 'DANGER';
    else if (count >= 1) status = 'SAFE'; // Provisional status for 1 entry

    // Base result structure (safe defaults)
    const baseResult = {
        entries: monthEntries,
        entriesWithIncrease,
        firstTotal,
        latestTotal, // internal use
        totalHours: latestTotal, // explicit match for UI
        firstDate: first ? first.date : null,
        latestDate: latest ? latest.date : null,
        daysInMonth,
        entryCount: count,
        hasInvalidData: invalidDetected,
        status,
        progressPercentage,

        // Items requiring >= 2 entries to compute correctly
        daysBetween: 0,
        daysCovers: 0, // explicit match for UI
        avgPerDay: 0,
        dailyAverage: 0, // explicit match for UI
        projectedTotal: 0,
        remainingHours: FREE_HOUR_LIMIT - latestTotal, // naive remaining
    };

    // Not enough data for projection metrics
    if (count < 2) {
        // If 1 entry, remaining is just limit - current. Projected is just current (conservative).
        if (count === 1) {
            baseResult.remainingHours = safeFixed(FREE_HOUR_LIMIT - latestTotal, 2);
            baseResult.projectedTotal = safeFixed(latestTotal, 2);
        }
        return baseResult;
    }

    // --- Complex Stats (>= 2 entries) ---

    // Days covered
    const daysBetweenEntries = daysBetween(first.date, latest.date);

    // Guard against division by zero (same-day entries?)
    const avgPerDay = daysBetweenEntries > 0
        ? (latestTotal - firstTotal) / daysBetweenEntries
        : 0;

    const projectedTotal = invalidDetected ? 0 : (avgPerDay * daysInMonth); // Simple linear projection (avg * 30/31)
    // Alternative projection: latestTotal + (avgPerDay * (daysInMonth - dayOfMonthOfLatest))?
    // User requested "projected Total". avg/day * daysInMonth is a standard rough projection.

    const remainingHours = invalidDetected ? 0 : (FREE_HOUR_LIMIT - latestTotal);
    // Wait, remaining should be limit - current usage. The UI shows "Remaining".
    // "Projected" is where this usage is heading.
    // Logic check: remainingHours = Limit - Current Total (simple) OR Limit - Projected?
    // Usually "Remaining" means "How much buffer do I have left right now?".
    // I'll stick to Limit - Recent Total for "Remaining".

    // Determine Status based on projection
    if (!invalidDetected) {
        if (projectedTotal >= FREE_HOUR_LIMIT) {
            status = 'DANGER';
        } else if (projectedTotal > (FREE_HOUR_LIMIT * 0.9)) {
            status = 'WARNING'; // e.g. close to limit
        } else {
            status = 'SAFE';
        }
    }

    return {
        ...baseResult,
        daysBetween: daysBetweenEntries,
        daysCovers: daysBetweenEntries,
        avgPerDay: safeFixed(avgPerDay, 4),
        dailyAverage: safeFixed(avgPerDay, 4),
        projectedTotal: safeFixed(projectedTotal, 2),
        remainingHours: safeFixed(remainingHours, 2),
        status,
    };
}

/**
 * Safely convert a value to a number, defaulting to 0.
 * @param {*} val
 * @returns {number}
 */
function safeNumber(val) {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
}

/**
 * Safely convert a number to fixed decimal places, preventing NaN.
 * @param {number} val
 * @param {number} decimals
 * @returns {number}
 */
function safeFixed(val, decimals = 2) {
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Number(num.toFixed(decimals));
}

/**
 * Compute the daily average for the previous month (relative to a given month/year).
 * Returns null if insufficient data exists for the previous month.
 *
 * @param {Array<{ date: string, totalHours: number }>} allEntries - Sorted chronologically
 * @param {number} month - 1-indexed current month
 * @param {number} year - Current year
 * @returns {number|null} Previous month's daily average, or null
 */
export function computePreviousMonthAvg(allEntries, month, year) {
    // Determine previous month/year
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = year - 1;
    }

    const prevEntries = (allEntries || []).filter((e) => isInMonth(e.date, prevMonth, prevYear));
    if (prevEntries.length < 2) return null;

    const first = prevEntries[0];
    const last = prevEntries[prevEntries.length - 1];
    const days = daysBetween(first.date, last.date);
    if (days <= 0) return null;

    const avg = (safeNumber(last.totalHours) - safeNumber(first.totalHours)) / days;
    return safeFixed(avg, 4);
}

/**
 * Extract totalHours values for entries in the selected month (for sparkline display).
 *
 * @param {Array<{ date: string, totalHours: number }>} allEntries
 * @param {number} month - 1-indexed
 * @param {number} year
 * @returns {number[]}
 */
export function getMonthlySparklineData(allEntries, month, year) {
    return (allEntries || [])
        .filter((e) => isInMonth(e.date, month, year))
        .map((e) => safeNumber(e.totalHours));
}
