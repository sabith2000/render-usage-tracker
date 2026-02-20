import { CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';
import { STATUS_COLORS } from '../utils/constants.js';

const STATUS_ICONS = {
    SAFE: CheckCircle2,
    WARNING: AlertTriangle,
    DANGER: AlertOctagon,
    'INVALID DATA': AlertTriangle,
    WAITING: Clock,
};

/**
 * StatusBadge — Visual indicator of current usage status.
 * Uses STATUS_COLORS from constants.js for consistent theming.
 *
 * @param {{ status: 'SAFE'|'DANGER'|'WARNING'|'WAITING'|'INVALID DATA' }} props
 */
function StatusBadge({ status }) {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.WAITING;
    const Icon = STATUS_ICONS[status] || Clock;

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colors.bg} ${colors.border} ${colors.text} ${colors.shadow} transition-all duration-300 animate-fade-in`}>
            <Icon className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide uppercase font-sans">
                {colors.label}
            </span>
        </div>
    );
}

export default StatusBadge;
