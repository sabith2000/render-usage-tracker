import { getAvailableMonths } from '../utils/dateHelpers.js';
import { MONTH_NAMES } from '../utils/dateHelpers.js';

/**
 * MonthSelector — dropdown for selecting month/year to view.
 *
 * @param {{
 *   entries: Array,
 *   selectedMonth: number,
 *   selectedYear: number,
 *   onSelect: (month: number, year: number) => void,
 * }} props
 */
function MonthSelector({ entries, selectedMonth, selectedYear, onSelect }) {
    const availableMonths = getAvailableMonths(entries);

    // Add current month if not already in the list
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const hasCurrentMonth = availableMonths.some(
        (m) => m.month === currentMonth && m.year === currentYear
    );

    if (!hasCurrentMonth) {
        availableMonths.unshift({
            month: currentMonth,
            year: currentYear,
            label: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`,
        });
    }

    const currentValue = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    const handleChange = (e) => {
        const [year, month] = e.target.value.split('-').map(Number);
        onSelect(month, year);
    };

    return (
        <div className="flex items-center gap-3">
            <label
                htmlFor="month-selector"
                className="text-sm font-medium text-surface-400 whitespace-nowrap"
            >
                📅 Month
            </label>
            <select
                id="month-selector"
                value={currentValue}
                onChange={handleChange}
                className="input-field w-auto min-w-[200px] cursor-pointer"
            >
                {availableMonths.map((m) => {
                    const value = `${m.year}-${String(m.month).padStart(2, '0')}`;
                    return (
                        <option key={value} value={value}>
                            {m.label}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export default MonthSelector;
