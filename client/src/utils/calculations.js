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

    // Default/empty state
    const emptyResult = {
        entries: monthEntries,
        entriesWithIncrease,
        firstTotal: null,
        latestTotal: null,
        firstDate: null,
        latestDate: null,
        daysBetween: 0,
        avgPerDay: 0,
        projectedTotal: 0,
        remainingHours: FREE_HOUR_LIMIT,
        daysInMonth,
        entryCount: monthEntries.length,
        hasInvalidData: invalidDetected,
        status: 'WAITING',
    };

    // Not enough data for projection
    if (monthEntries.length < 2) {
        return emptyResult;
    }

    // If invalid data detected, return stats but mark as invalid
    const first = monthEntries[0];
    const latest = monthEntries[monthEntries.length - 1];

    const firstTotal = safeNumber(first.totalHours);
    const latestTotal = safeNumber(latest.totalHours);
    const daysBetweenEntries = daysBetween(first.date, latest.date);

    // Guard against division by zero
    const avgPerDay = daysBetweenEntries > 0
        ? (latestTotal - firstTotal) / daysBetweenEntries
        : 0;

    const projectedTotal = invalidDetected ? 0 : avgPerDay * daysInMonth;
    const remainingHours = invalidDetected ? 0 : FREE_HOUR_LIMIT - projectedTotal;

    // Determine status
    let status;
    if (invalidDetected) {
        status = 'INVALID DATA';
    } else if (projectedTotal >= FREE_HOUR_LIMIT) {
        status = 'DANGER';
    } else {
        status = 'SAFE';
    }

    return {
        entries: monthEntries,
        entriesWithIncrease,
        firstTotal,
        latestTotal,
        firstDate: first.date,
        latestDate: latest.date,
        daysBetween: daysBetweenEntries,
        avgPerDay: safeFixed(avgPerDay, 4),
        projectedTotal: safeFixed(projectedTotal, 2),
        remainingHours: safeFixed(remainingHours, 2),
        daysInMonth,
        entryCount: monthEntries.length,
        hasInvalidData: invalidDetected,
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
