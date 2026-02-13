import { CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

/**
 * StatusBadge — Visual indicator of current usage status.
 *
 * @param {{ status: 'SAFE'|'DANGER'|'WARNING'|'WAITING'|'INVALID DATA' }} props
 */
function StatusBadge({ status }) {
    let colorClass = 'bg-surface-700 text-surface-300 border-surface-600';
    let Icon = Clock;
    let label = status;

    switch (status) {
        case 'SAFE':
            colorClass = 'bg-success-900/30 text-success-400 border-success-800/50';
            Icon = CheckCircle2;
            break;
        case 'WARNING':
            colorClass = 'bg-warning-900/30 text-warning-400 border-warning-800/50';
            Icon = AlertTriangle;
            break;
        case 'DANGER':
            colorClass = 'bg-danger-900/30 text-danger-400 border-danger-800/50';
            Icon = AlertOctagon;
            break;
        case 'INVALID DATA':
            colorClass = 'bg-orange-900/30 text-orange-400 border-orange-800/50';
            Icon = AlertTriangle;
            break;
        default:
            colorClass = 'bg-surface-800 text-surface-400 border-surface-700';
            Icon = Clock;
            label = 'WAITING FOR DATA';
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass} transition-colors duration-300 animate-fade-in`}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide uppercase font-sans">
                {label}
            </span>
        </div>
    );
}

export default StatusBadge;
