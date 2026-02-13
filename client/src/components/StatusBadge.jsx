import { STATUS_COLORS } from '../utils/constants.js';

/**
 * StatusBadge — displays current month status with color coding.
 * @param {{ status: string }} props
 */
function StatusBadge({ status }) {
    const config = STATUS_COLORS[status] || STATUS_COLORS.WAITING;

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bg} ${config.border} transition-all duration-300`}
        >
            <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse-slow`} />
            <span className={`text-sm font-semibold tracking-wide ${config.text}`}>
                {config.label}
            </span>
        </div>
    );
}

export default StatusBadge;
