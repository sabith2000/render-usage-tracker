/**
 * Custom hook for managing entries state and CRUD operations.
 * Handles loading, error, and data states.
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api.js';
import { toSortableDate } from '../utils/dateHelpers.js';
import toast from 'react-hot-toast';

/**
 * Sort entries chronologically by date.
 * @param {Array} entries
 * @returns {Array}
 */
function sortEntries(entries) {
    return [...entries].sort(
        (a, b) => toSortableDate(a.date).localeCompare(toSortableDate(b.date))
    );
}

/**
 * Hook for managing entry CRUD with automatic sorting and toast notifications.
 *
 * @returns {{
 *   entries: Array,
 *   loading: boolean,
 *   error: string|null,
 *   addEntry: (entry) => Promise<boolean>,
 *   updateEntry: (id, entry) => Promise<boolean>,
 *   deleteEntry: (id) => Promise<boolean>,
 *   clearAll: () => Promise<boolean>,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useEntries() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch all entries from the API.
     */
    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getEntries();
            setEntries(sortEntries(data));
        } catch (err) {
            const message = api.getErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    /**
     * Add a new entry.
     * @param {{ date: string, totalHours: number }} entry
     * @returns {Promise<boolean>} success
     */
    const addEntry = useCallback(async (entry) => {
        try {
            const saved = await api.addEntry(entry);
            setEntries((prev) => sortEntries([...prev, saved]));
            toast.success(`Entry for ${entry.date} added successfully`);
            return true;
        } catch (err) {
            const message = api.getErrorMessage(err);
            toast.error(message);
            return false;
        }
    }, []);

    /**
     * Update an existing entry.
     * @param {string} id
     * @param {{ date: string, totalHours: number }} entry
     * @returns {Promise<boolean>} success
     */
    const updateEntry = useCallback(async (id, entry) => {
        try {
            const updated = await api.updateEntry(id, entry);
            setEntries((prev) =>
                sortEntries(prev.map((e) => (e._id === id ? updated : e)))
            );
            toast.success(`Entry for ${entry.date} updated successfully`);
            return true;
        } catch (err) {
            const message = api.getErrorMessage(err);
            toast.error(message);
            return false;
        }
    }, []);

    /**
     * Delete an entry.
     * @param {string} id
     * @returns {Promise<boolean>} success
     */
    const deleteEntry = useCallback(async (id) => {
        try {
            await api.deleteEntry(id);
            setEntries((prev) => prev.filter((e) => e._id !== id));
            toast.success('Entry deleted successfully');
            return true;
        } catch (err) {
            const message = api.getErrorMessage(err);
            toast.error(message);
            return false;
        }
    }, []);

    /**
     * Clear all entries (delete one by one).
     * @returns {Promise<boolean>} success
     */
    const clearAll = useCallback(async () => {
        try {
            const deletePromises = entries.map((e) => api.deleteEntry(e._id));
            await Promise.all(deletePromises);
            setEntries([]);
            toast.success('All entries cleared successfully');
            return true;
        } catch (err) {
            const message = api.getErrorMessage(err);
            toast.error(message);
            // Refetch to get the actual state
            await fetchEntries();
            return false;
        }
    }, [entries, fetchEntries]);

    return {
        entries,
        loading,
        error,
        addEntry,
        updateEntry,
        deleteEntry,
        clearAll,
        refetch: fetchEntries,
    };
}
