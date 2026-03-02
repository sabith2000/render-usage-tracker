import { useMemo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { MONTH_NAMES, isInMonth } from '../utils/dateHelpers.js';

/**
 * MonthTransitionBanner — Shows when the selected month has no entries yet
 * but the previous month has data. Signals a clean usage reset.
 *
 * @param {{ selectedMonth: number, selectedYear: number, entries: Array }} props
 */
function MonthTransitionBanner({ selectedMonth, selectedYear, entries = [] }) {
    const bannerInfo = useMemo(() => {
        // Check if current selected month has entries
        const currentMonthEntries = entries.filter((e) =>
            isInMonth(e.date, selectedMonth, selectedYear)
        );
        if (currentMonthEntries.length > 0) return null;

        // Check if previous month had entries
        let prevMonth = selectedMonth - 1;
        let prevYear = selectedYear;
        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear -= 1;
        }

        const prevMonthEntries = entries.filter((e) =>
            isInMonth(e.date, prevMonth, prevYear)
        );
        if (prevMonthEntries.length === 0) return null;

        const lastEntry = prevMonthEntries[prevMonthEntries.length - 1];

        return {
            currentMonth: MONTH_NAMES[selectedMonth - 1],
            prevMonth: MONTH_NAMES[prevMonth - 1],
            prevYear,
            prevLastHours: lastEntry.totalHours,
        };
    }, [selectedMonth, selectedYear, entries]);

    if (!bannerInfo) return null;

    return (
        <div className="animate-fade-in rounded-xl border-l-4 border-brand-500 bg-surface-800/60 backdrop-blur-sm px-5 py-4 flex items-center gap-4">
            <div className="p-2 bg-brand-500/10 rounded-lg shrink-0">
                <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-100">
                    {bannerInfo.currentMonth} usage started
                </p>
                <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1.5">
                    Monthly counter reset
                    <ArrowRight className="w-3 h-3 text-surface-500" />
                    <span className="text-surface-300">
                        {bannerInfo.prevMonth} ended at {bannerInfo.prevLastHours} hrs
                    </span>
                </p>
            </div>
        </div>
    );
}

export default MonthTransitionBanner;
