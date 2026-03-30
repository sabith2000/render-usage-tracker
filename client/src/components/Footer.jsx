import { useState, useEffect } from 'react';
import { APP_VERSION } from '../utils/constants.js';

/**
 * Format a Date into a human-readable relative time string.
 * @param {Date|null} date
 * @returns {string|null}
 */
function formatRelativeTime(date) {
    if (!date) return null;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

/**
 * Footer — Copyright, credits, version info, and last-synced timestamp.
 *
 * @param {{ lastSynced: Date|null }} props
 */
function Footer({ lastSynced = null }) {
    const currentYear = new Date().getFullYear();

    // Re-render every 30s to keep relative time fresh
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!lastSynced) return;
        const interval = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(interval);
    }, [lastSynced]);

    const relativeTime = formatRelativeTime(lastSynced);

    return (
        <footer className="mt-8 border-t border-surface-800 py-8 bg-surface-950/50">
            <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-surface-400 text-sm">
                    © {currentYear} Render Usage Monitor.
                </div>

                <div className="flex items-center gap-3">
                    {relativeTime && (
                        <span className="text-xs text-surface-500 font-sans">
                            Synced {relativeTime}
                        </span>
                    )}
                    <span className="text-xs font-mono text-surface-500 bg-surface-900 px-2 py-1 rounded border border-surface-800">
                        v{APP_VERSION}
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
