import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Check } from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateHelpers.js';

/**
 * MonthSelector — Custom dropdown (Listbox) to switch between available reporting months.
 *
 * @param {{
 *   entries: Array,
 *   selectedMonth: number,
 *   selectedYear: number,
 *   onSelect: (month: number, year: number) => void,
 * }} props
 */
function MonthSelector({ entries, selectedMonth, selectedYear, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Extract unique month-year combos from entries
    const options = entries.reduce((acc, entry) => {
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

    const selectedOption = options.find(o => o.key === currentKey) || options[0];

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-3" ref={containerRef}>
            <span className="hidden sm:inline text-surface-400 font-medium">
                Viewing:
            </span>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 bg-surface-800 border ${isOpen ? 'border-brand-500 ring-1 ring-brand-500' : 'border-surface-700 hover:border-surface-600'
                        } text-surface-100 pl-4 pr-3 py-2 rounded-lg font-medium shadow-sm transition-all outline-none w-full sm:w-auto min-w-[160px] justify-between`}
                >
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-surface-400" />
                        {MONTH_NAMES[selectedOption.month - 1]} {selectedOption.year}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full mt-2 right-0 w-full sm:w-64 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up origin-top-right">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {options.map((opt) => {
                                const isSelected = opt.key === currentKey;
                                return (
                                    <button
                                        key={opt.key}
                                        onClick={() => {
                                            onSelect(opt.month, opt.year);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                                                ? 'bg-brand-500/10 text-brand-400'
                                                : 'text-surface-300 hover:bg-surface-700 hover:text-surface-100'
                                            }`}
                                    >
                                        <span className="font-medium">
                                            {MONTH_NAMES[opt.month - 1]} {opt.year}
                                        </span>
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MonthSelector;
