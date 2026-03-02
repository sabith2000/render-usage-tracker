/**
 * Shared constants used across the app.
 */

export const APP_VERSION = '0.0.11-dev';

export const FREE_HOUR_LIMIT = 750;

export const STATUS_COLORS = {
    SAFE: {
        bg: 'bg-success-500/15',
        border: 'border-success-500/50',
        text: 'text-success-400',
        shadow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]',
        label: 'SAFE',
    },
    WARNING: {
        bg: 'bg-warning-500/15',
        border: 'border-warning-500/50',
        text: 'text-warning-400',
        shadow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]',
        label: 'WARNING',
    },
    DANGER: {
        bg: 'bg-danger-500/15',
        border: 'border-danger-500/50',
        text: 'text-danger-400',
        shadow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]',
        label: 'DANGER',
    },
    'INVALID DATA': {
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/50',
        text: 'text-orange-400',
        shadow: 'shadow-[0_0_15px_-3px_rgba(249,115,22,0.2)]',
        label: 'INVALID DATA',
    },
    WAITING: {
        bg: 'bg-surface-800',
        border: 'border-surface-700',
        text: 'text-surface-400',
        shadow: '',
        label: 'WAITING FOR DATA',
    },
};
