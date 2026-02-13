/**
 * Shared constants used across the app.
 */

export const APP_VERSION = '0.0.5-dev';

export const FREE_HOUR_LIMIT = 750;

export const STATUS_COLORS = {
    SAFE: {
        bg: 'bg-success-500/10',
        border: 'border-success-500/30',
        text: 'text-success-400',
        dot: 'bg-success-500',
        label: 'SAFE',
    },
    DANGER: {
        bg: 'bg-danger-500/10',
        border: 'border-danger-500/30',
        text: 'text-danger-400',
        dot: 'bg-danger-500',
        label: 'DANGER',
    },
    WAITING: {
        bg: 'bg-surface-500/10',
        border: 'border-surface-500/30',
        text: 'text-surface-400',
        dot: 'bg-surface-500',
        label: 'WAITING',
    },
    'INVALID DATA': {
        bg: 'bg-warning-500/10',
        border: 'border-warning-500/30',
        text: 'text-warning-400',
        dot: 'bg-warning-500',
        label: 'INVALID DATA',
    },
};
