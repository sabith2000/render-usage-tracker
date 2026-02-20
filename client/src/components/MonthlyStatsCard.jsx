import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle, PieChart, Minus } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { computePreviousMonthAvg, getMonthlySparklineData } from '../utils/calculations.js';

/**
 * Sparkline — Simple SVG sparkline for visualizing usage trend.
 */
function Sparkline({ data, width = 120, height = 32 }) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = padding + (1 - (val - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });

    const polyline = points.join(' ');
    // Fill area under the line
    const areaPoints = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

    return (
        <svg width={width} height={height} className="opacity-80">
            {/* Gradient fill under the line */}
            <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(129, 140, 248)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(129, 140, 248)" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon
                points={areaPoints}
                fill="url(#sparklineGrad)"
            />
            <polyline
                points={polyline}
                fill="none"
                stroke="rgb(129, 140, 248)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            {data.length > 0 && (
                <circle
                    cx={padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)}
                    cy={padding + (1 - (data[data.length - 1] - min) / range) * (height - padding * 2)}
                    r="2.5"
                    fill="rgb(129, 140, 248)"
                />
            )}
        </svg>
    );
}

/**
 * TrendIndicator — Up/down arrow comparing current vs previous month's daily avg.
 */
function TrendIndicator({ currentAvg, prevMonthAvg }) {
    if (prevMonthAvg === null || prevMonthAvg === undefined || currentAvg === 0) return null;

    const diff = currentAvg - prevMonthAvg;
    const pctChange = prevMonthAvg !== 0 ? ((diff / prevMonthAvg) * 100) : 0;

    if (Math.abs(pctChange) < 0.5) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-surface-400 ml-2 font-sans">
                <Minus className="w-3 h-3" />
                same
            </span>
        );
    }

    const isUp = diff > 0;
    return (
        <span className={`inline-flex items-center gap-1 text-xs ml-2 font-sans ${isUp ? 'text-danger-400' : 'text-success-400'}`}>
            {isUp ? (
                <TrendingUp className="w-3 h-3" />
            ) : (
                <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(pctChange).toFixed(1)}%
        </span>
    );
}

/**
 * MonthlyStatsCard — Summary of usage for the selected month.
 *
 * @param {{
 *   stats: object,
 *   monthLabel: string,
 *   entries: Array,
 *   selectedMonth: number,
 *   selectedYear: number,
 * }} props
 */
function MonthlyStatsCard({ stats, monthLabel, entries, selectedMonth, selectedYear }) {
    const {
        totalHours = 0,
        dailyAverage = 0,
        projectedTotal = 0,
        remainingHours = 750,
        status,
        progressPercentage = 0,
    } = stats || {};

    const prevMonthAvg = useMemo(
        () => computePreviousMonthAvg(entries, selectedMonth, selectedYear),
        [entries, selectedMonth, selectedYear]
    );

    const sparklineData = useMemo(
        () => getMonthlySparklineData(entries, selectedMonth, selectedYear),
        [entries, selectedMonth, selectedYear]
    );

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

                {/* Daily Avg + Trend */}
                <div className="p-4 bg-surface-900/50 rounded-xl border border-surface-800 hover:border-surface-700 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-surface-400">
                        <TrendingUp className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
                        <p className="text-sm font-medium">Daily Avg</p>
                    </div>
                    <div className="flex items-baseline flex-wrap">
                        <p className="text-2xl font-bold text-brand-300 tabular-nums font-sans">
                            {dailyAverage.toFixed(2)}
                            <span className="text-sm font-normal text-surface-500 ml-1">hrs</span>
                        </p>
                        <TrendIndicator currentAvg={dailyAverage} prevMonthAvg={prevMonthAvg} />
                    </div>
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

            {/* Sparkline — Usage trend for current month */}
            {sparklineData.length >= 2 && (
                <div className="flex items-center gap-3 mb-5 px-1">
                    <span className="text-xs text-surface-500 font-sans whitespace-nowrap">Usage Trend</span>
                    <Sparkline data={sparklineData} width={160} height={28} />
                </div>
            )}

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
                    <span>0 hrs</span>
                    <span>{750} hrs Limit</span>
                </div>
            </div>
        </div>
    );
}

export default MonthlyStatsCard;
