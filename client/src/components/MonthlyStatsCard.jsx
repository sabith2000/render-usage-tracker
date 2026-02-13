import { TrendingUp, Clock, Target, AlertTriangle, PieChart } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

/**
 * MonthlyStatsCard — Summary of usage for the selected month.
 *
 * @param {{
 *   stats: object,
 *   monthLabel: string
 * }} props
 */
function MonthlyStatsCard({ stats, monthLabel }) {
    const {
        totalHours = 0,
        dailyAverage = 0,
        projectedTotal = 0,
        remainingHours = 750,
        status,
        progressPercentage = 0,
    } = stats || {};

    return (
        <div className="card p-6 animate-slide-up shadow-glow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-brand-400" />
                        Monthly Overview
                        <span className="text-surface-400 text-sm font-normal hidden sm:inline font-sans">
                            • {monthLabel}
                        </span>
                    </h3>
                    <p className="text-surface-400 text-sm sm:hidden mt-1">{monthLabel}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Used */}
                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-surface-400">
                        <Clock className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
                        <p className="text-sm font-medium">Total Used</p>
                    </div>
                    <p className="text-2xl font-bold text-surface-100 tabular-nums font-sans">
                        {totalHours.toFixed(2)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>

                {/* Daily Avg */}
                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-surface-400">
                        <TrendingUp className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
                        <p className="text-sm font-medium">Daily Avg</p>
                    </div>
                    <p className="text-2xl font-bold text-brand-300 tabular-nums font-sans">
                        {dailyAverage.toFixed(2)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>

                {/* Projected */}
                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-surface-400">
                        <Target className="w-4 h-4 text-warning-400 group-hover:text-warning-300 transition-colors" />
                        <p className="text-sm font-medium">Projected</p>
                    </div>
                    <p className="text-2xl font-bold text-warning-300 tabular-nums font-sans">
                        {projectedTotal.toFixed(0)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>

                {/* Remaining */}
                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-surface-400">
                        <AlertTriangle className={`w-4 h-4 transition-colors ${remainingHours < 0 ? 'text-danger-400' : 'text-success-400'}`} />
                        <p className="text-sm font-medium">Remaining</p>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <p className={`text-2xl font-bold tabular-nums font-sans ${remainingHours < 0 ? 'text-danger-400' : 'text-success-400'}`}>
                            {Math.floor(remainingHours)}
                            <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                        </p>
                        {/* Detailed decimal view requested by user */}
                        <span className="text-xs text-surface-500 font-mono tabular-nums opacity-75">
                            ({remainingHours.toFixed(2)} hrs)
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-surface-400 items-end">
                    <span className="font-medium">Usage Progress</span>
                    <span className="tabular-nums font-medium font-sans text-brand-200">
                        {progressPercentage.toFixed(1)}%
                    </span>
                </div>

                <div className="h-4 bg-surface-900 rounded-full overflow-hidden border border-surface-800 relative">
                    {/* Background tick marks for 25%, 50%, 75% */}
                    <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none opacity-20">
                        <div className="w-px h-full bg-surface-500"></div>
                        <div className="w-px h-full bg-surface-500"></div>
                        <div className="w-px h-full bg-surface-500"></div>
                    </div>

                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progressPercentage >= 100 ? 'bg-danger-500' :
                            progressPercentage >= 80 ? 'bg-warning-500' : 'bg-brand-500'
                            }`}
                        style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
                    >
                        {/* Simple shine effect */}
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                    </div>
                </div>

                <div className="flex justify-between text-xs text-surface-500 mt-1 font-sans">
                    <span>Start</span>
                    <span>{750} hrs Limit</span>
                </div>
            </div>
        </div>
    );
}

export default MonthlyStatsCard;
