import { MONTH_NAMES } from '../utils/dateHelpers.js';

/**
 * MonthSelector — Dropdown to switch between available reporting months.
 *
 * @param {{
 *   entries: Array,
 *   selectedMonth: number,
 *   selectedYear: number,
 *   onSelect: (month: number, year: number) => void,
 * }} props
 */
function MonthSelector({ entries, selectedMonth, selectedYear, onSelect }) {
    // Extract unique month-year combos from entries
    const options = entries.reduce((acc, entry) => {
        // entry.date is DD-MM-YYYY
        const [_, mm, yyyy] = entry.date.split('-');
        const m = parseInt(mm, 10);
        const y = parseInt(yyyy, 10);
        const key = `${m}-${y}`;

        if (!acc.find((o) => o.key === key)) {
            acc.push({ month: m, year: y, key });
        }
        return acc;
    }, []);

    // Ensure selected option is in list (even if no entries yet)
    const currentKey = `${selectedMonth}-${selectedYear}`;
    if (!options.find((o) => o.key === currentKey)) {
        options.push({ month: selectedMonth, year: selectedYear, key: currentKey });
    }

    // Sort: Newest first
    options.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    return (
        <div className="flex items-center gap-3">
            {/* Label hidden on mobile for cleaner look */}
            <span className="hidden sm:inline text-surface-400 font-medium">
                Viewing:
            </span>

            <div className="relative group">
                <select
                    value={currentKey}
                    onChange={(e) => {
                        const [m, y] = e.target.value.split('-');
                        onSelect(parseInt(m, 10), parseInt(y, 10));
                    }}
                    className="appearance-none bg-surface-800 border border-surface-700 text-surface-100 
                     pl-4 pr-10 py-2 rounded-lg font-medium shadow-sm transition-all
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                     hover:border-surface-600 cursor-pointer w-full sm:w-auto"
                >
                    {options.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                            {MONTH_NAMES[opt.month - 1]} {opt.year}
                        </option>
                    ))}
                </select>

                {/* Custom Arrow Icon - Absolute positioned and centered vertically */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-surface-400 group-hover:text-brand-400 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default MonthSelector;
