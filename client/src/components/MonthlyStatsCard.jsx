import StatusBadge from './StatusBadge.jsx';
import { FREE_HOUR_LIMIT } from '../utils/constants.js';

/**
 * MonthlyStatsCard — displays computed statistics for the selected month.
 *
 * @param {{
 *   stats: object,
 *   monthLabel: string,
 * }} props
 */
function MonthlyStatsCard({ stats, monthLabel }) {
    const {
        firstTotal,
        latestTotal,
        firstDate,
        latestDate,
        daysBetween,
        avgPerDay,
        projectedTotal,
        remainingHours,
        daysInMonth,
        entryCount,
        hasInvalidData: invalidData,
        status,
    } = stats;

    const isWaiting = status === 'WAITING';
    const isInvalid = status === 'INVALID DATA';

    /**
     * Render a stat row.
     */
    const StatRow = ({ label, value, sub, highlight, warn }) => (
        <div className="flex items-baseline justify-between py-2.5 border-b border-surface-700/50 last:border-b-0">
            <span className="text-sm text-surface-400">{label}</span>
            <div className="text-right">
                <span
                    className={`text-sm font-mono font-medium ${warn
                            ? 'text-warning-400'
                            : highlight
                                ? 'text-brand-300'
                                : 'text-surface-100'
                        }`}
                >
                    {value}
                </span>
                {sub && <span className="text-xs text-surface-500 ml-1">{sub}</span>}
            </div>
        </div>
    );

    return (
        <div className="card animate-slide-up">
            {/* Header */}
            <div className="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-surface-100">
                        📈 Monthly Statistics
                    </h2>
                    <p className="text-sm text-surface-500 mt-0.5">{monthLabel}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Content */}
            <div className="px-5 py-4">
                {isWaiting ? (
                    <div className="text-center py-6">
                        <p className="text-surface-400 text-sm">
                            {entryCount === 0
                                ? 'No entries for this month yet.'
                                : 'Need at least 2 entries to calculate projections.'}
                        </p>
                        <p className="text-surface-500 text-xs mt-1">
                            {entryCount} {entryCount === 1 ? 'entry' : 'entries'} recorded
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        <StatRow
                            label="First Recorded"
                            value={firstTotal != null ? firstTotal.toFixed(2) : '—'}
                            sub={firstDate ? `(${firstDate})` : ''}
                        />
                        <StatRow
                            label="Latest Total"
                            value={latestTotal != null ? latestTotal.toFixed(2) : '—'}
                            sub={latestDate ? `(${latestDate})` : ''}
                        />
                        <StatRow
                            label="Days Between"
                            value={daysBetween}
                            sub="days"
                        />
                        <StatRow
                            label="Days In Month"
                            value={daysInMonth}
                            sub="days"
                        />
                        <StatRow
                            label="Average / Day"
                            value={avgPerDay}
                            sub="hrs/day"
                            highlight
                        />

                        {/* Separator */}
                        <div className="my-3 border-t border-surface-600" />

                        {isInvalid ? (
                            <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-3 text-center">
                                <p className="text-warning-400 text-sm font-medium">
                                    ⚠️ Projection disabled — invalid data detected
                                </p>
                                <p className="text-warning-500/70 text-xs mt-1">
                                    Fix or remove entries with negative daily increase
                                </p>
                            </div>
                        ) : (
                            <>
                                <StatRow
                                    label="Projected Month Total"
                                    value={projectedTotal}
                                    sub={`/ ${FREE_HOUR_LIMIT} hrs`}
                                    highlight
                                />
                                <StatRow
                                    label="Remaining Free Hours"
                                    value={remainingHours}
                                    sub="hrs"
                                    warn={remainingHours < 0}
                                />

                                {/* Usage bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                                        <span>Usage Projection</span>
                                        <span>
                                            {Math.min(
                                                100,
                                                Math.max(0, ((projectedTotal / FREE_HOUR_LIMIT) * 100))
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-surface-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${projectedTotal >= FREE_HOUR_LIMIT
                                                    ? 'bg-gradient-to-r from-danger-500 to-danger-400'
                                                    : projectedTotal >= FREE_HOUR_LIMIT * 0.8
                                                        ? 'bg-gradient-to-r from-warning-500 to-warning-400'
                                                        : 'bg-gradient-to-r from-brand-600 to-success-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(100, Math.max(0, (projectedTotal / FREE_HOUR_LIMIT) * 100))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MonthlyStatsCard;
