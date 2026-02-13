import { CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

/**
 * StatusBadge — Visual indicator of current usage status.
 *
 * @param {{ status: 'SAFE'|'DANGER'|'WARNING'|'WAITING'|'INVALID DATA' }} props
 */
function StatusBadge({ status }) {
    let colorClass = 'bg-surface-800 text-surface-400 border-surface-700';
    let Icon = Clock;
    let label = status;

    switch (status) {
        case 'SAFE':
            colorClass = 'bg-success-500/15 text-success-400 border-success-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
            Icon = CheckCircle2;
            break;
        case 'WARNING':
            colorClass = 'bg-warning-500/15 text-warning-400 border-warning-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]';
            Icon = AlertTriangle;
            break;
        case 'DANGER':
            colorClass = 'bg-danger-500/15 text-danger-400 border-danger-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]';
            Icon = AlertOctagon;
            break;
        case 'INVALID DATA':
            colorClass = 'bg-orange-500/15 text-orange-400 border-orange-500/50 shadow-[0_0_15px_-3px_rgba(249,115,22,0.2)]';
            Icon = AlertTriangle;
            break;
        default:
            colorClass = 'bg-surface-800 text-surface-400 border-surface-700';
            Icon = Clock;
            label = 'WAITING FOR DATA';
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colorClass} transition-all duration-300 animate-fade-in`}>
            <Icon className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide uppercase font-sans">
                {label}
            </span>
        </div>
    );
}

export default StatusBadge;
