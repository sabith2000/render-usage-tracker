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
        totalHours,
        daysCovers,
        dailyAverage,
        projectedTotal,
        remainingHours,
        status,
        progressPercentage,
    } = stats;

    return (
        <div className="card p-6 animate-slide-up shadow-glow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                        📊 Monthly Overview
                        <span className="text-surface-400 text-sm font-normal hidden sm:inline">
                            • {monthLabel}
                        </span>
                    </h3>
                    <p className="text-surface-400 text-sm sm:hidden mt-1">{monthLabel}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors">
                    <p className="text-sm text-surface-400 mb-1">Total Used</p>
                    <p className="text-2xl font-bold text-surface-100 tabular-nums">
                        {totalHours.toFixed(2)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>

                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors">
                    <p className="text-sm text-surface-400 mb-1">Daily Avg</p>
                    <p className="text-2xl font-bold text-brand-300 tabular-nums">
                        {dailyAverage.toFixed(2)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>

                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors">
                    <p className="text-sm text-surface-400 mb-1">Projected</p>
                    <p className="text-2xl font-bold text-warning-300 tabular-nums">
                        {projectedTotal.toFixed(0)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>

                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors">
                    <p className="text-sm text-surface-400 mb-1">Remaining</p>
                    <p className={`text-2xl font-bold tabular-nums ${remainingHours < 0 ? 'text-danger-400' : 'text-success-400'}`}>
                        {remainingHours.toFixed(0)}
                        <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-surface-400">
                    <span>Usage Progress</span>
                    <span className="tabular-nums font-medium">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-surface-900 rounded-full overflow-hidden border border-surface-800">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progressPercentage >= 100 ? 'bg-danger-500' :
                                progressPercentage >= 80 ? 'bg-warning-500' : 'bg-brand-500'
                            }`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    >
                        {/* Simple shine effect */}
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
                <div className="flex justify-between text-xs text-surface-500 mt-1">
                    <span>0 hrs</span>
                    <span>750 hrs Limit</span>
                </div>
            </div>
        </div>
    );
}

export default MonthlyStatsCard;
