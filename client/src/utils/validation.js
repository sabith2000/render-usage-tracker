/**
 * Validation utilities for entry data.
 * All validators return { valid: boolean, errors: { date?: string, hours?: string } }
 */

import { parseDate, isFutureDate, toSortableDate, getMonthYear } from './dateHelpers.js';

/**
 * Validate a new or edited entry against existing entries.
 * Cumulative constraint is month-scoped: hours must be non-decreasing
 * within the same month only. First entry of a new month has no floor.
 *
 * @param {{ date: string, totalHours: string|number }} entry - The entry to validate
 * @param {Array<{ _id: string, date: string, totalHours: number }>} existingEntries - Sorted chronologically
 * @param {string|null} editingId - ID of the entry being edited (null for new entries)
 * @returns {{ valid: boolean, errors: { date?: string, hours?: string } }}
 */
export function validateEntry(entry, existingEntries = [], editingId = null) {
    const errors = {};

    // --- Date Validation ---
    if (!entry.date || entry.date.trim() === '') {
        errors.date = 'Date is required';
    } else {
        const parsed = parseDate(entry.date);
        if (!parsed) {
            errors.date = 'Invalid date. Use DD-MM-YYYY format';
        } else if (isFutureDate(entry.date)) {
            errors.date = 'Date cannot be in the future';
        } else {
            // Check for duplicate date (excluding the entry being edited)
            const duplicateExists = existingEntries.some(
                (e) => e.date === entry.date && e._id !== editingId
            );
            if (duplicateExists) {
                errors.date = `Entry for ${entry.date} already exists`;
            }
        }
    }

    // --- Hours Validation ---
    const hoursStr = String(entry.totalHours).trim();

    if (hoursStr === '') {
        errors.hours = 'Total hours is required';
    } else {
        const hours = Number(hoursStr);

        if (isNaN(hours)) {
            errors.hours = 'Total hours must be a valid number';
        } else if (hours < 0) {
            errors.hours = 'Total hours must be >= 0';
        } else {
            // Month-scoped cumulative constraint:
            // Only compare against entries in the SAME month as the new entry.
            // First entry of a new month has no floor — any >= 0 value is fine.
            if (!errors.date && entry.date) {
                const entryMonthYear = getMonthYear(entry.date);

                if (entryMonthYear) {
                    const sameMonthEntries = existingEntries.filter((e) => {
                        if (e._id === editingId) return false;
                        const my = getMonthYear(e.date);
                        return my && my.month === entryMonthYear.month && my.year === entryMonthYear.year;
                    });

                    if (sameMonthEntries.length > 0) {
                        const sortableNewDate = toSortableDate(entry.date);

                        // Entries before this date in the same month
                        const entriesBefore = sameMonthEntries.filter(
                            (e) => toSortableDate(e.date) < sortableNewDate
                        );
                        // Entries after this date in the same month
                        const entriesAfter = sameMonthEntries.filter(
                            (e) => toSortableDate(e.date) > sortableNewDate
                        );

                        // Must be >= the last entry before it (same month)
                        if (entriesBefore.length > 0) {
                            const lastBefore = entriesBefore[entriesBefore.length - 1];
                            if (hours < lastBefore.totalHours) {
                                errors.hours = `Must be >= ${lastBefore.totalHours} (previous entry on ${lastBefore.date})`;
                            }
                        }

                        // Must be <= the first entry after it (same month)
                        if (entriesAfter.length > 0 && !errors.hours) {
                            const firstAfter = entriesAfter[0];
                            if (hours > firstAfter.totalHours) {
                                errors.hours = `Must be <= ${firstAfter.totalHours} (next entry on ${firstAfter.date})`;
                            }
                        }
                    }
                    // If sameMonthEntries is empty → first entry of this month → no constraint
                }
            }
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Check if a single field has an error based on touched state.
 *
 * @param {object} errors
 * @param {object} touched
 * @param {string} field
 * @returns {string|null}
 */
export function getFieldError(errors, touched, field) {
    if (touched[field] && errors[field]) {
        return errors[field];
    }
    return null;
}
