/**
 * API service layer for entries CRUD operations.
 * Communicates with the Express backend.
 */

import axios from 'axios';

// Base URL — in production, same origin. In dev, proxy is configured in vite.config
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

/**
 * Retry a request function with exponential backoff.
 * Only retries on network errors, timeouts, and 5xx server errors.
 * Mutating operations (POST/PUT/DELETE) should NOT use this.
 *
 * @param {() => Promise} fn - The request function to retry
 * @param {number} retries - Max number of retries (default: 2)
 * @returns {Promise}
 */
async function withRetry(fn, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isLastAttempt = attempt === retries;
            const isRetryable =
                !err.response ||
                err.response.status >= 500 ||
                err.code === 'ECONNABORTED';
            if (isLastAttempt || !isRetryable) throw err;
            // Exponential backoff: 2s, 4s
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        }
    }
}

/**
 * Fetch all entries (sorted chronologically by the server).
 * Uses retry logic to handle Render cold starts gracefully.
 * @returns {Promise<Array<{ _id: string, date: string, totalHours: number }>>}
 */
export async function getEntries() {
    return withRetry(async () => {
        const response = await api.get('/entries');
        return response.data;
    });
}

/**
 * Create a new entry.
 * @param {{ date: string, totalHours: number }} entry
 * @returns {Promise<{ _id: string, date: string, totalHours: number }>}
 */
export async function addEntry(entry) {
    const response = await api.post('/entries', entry);
    return response.data;
}

/**
 * Update an existing entry.
 * @param {string} id - Entry ID
 * @param {{ date: string, totalHours: number }} entry
 * @returns {Promise<{ _id: string, date: string, totalHours: number }>}
 */
export async function updateEntry(id, entry) {
    const response = await api.put(`/entries/${id}`, entry);
    return response.data;
}

/**
 * Delete an entry.
 * @param {string} id - Entry ID
 * @returns {Promise<{ message: string }>}
 */
export async function deleteEntry(id) {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
}

/**
 * Extract a user-friendly error message from an API error.
 * @param {Error} error
 * @returns {string}
 */
export function getErrorMessage(error) {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message === 'Network Error') {
        return 'Unable to connect to server. Please check your connection.';
    }
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. The server may be starting up — please try again.';
    }
    return 'An unexpected error occurred. Please try again.';
}
