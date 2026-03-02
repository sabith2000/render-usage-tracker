import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Calendar, Check } from 'lucide-react';
import { MONTH_NAMES, isInMonth, getNowIST } from '../utils/dateHelpers.js';

/**
 * MonthSelector — Custom dropdown to switch between available reporting months.
 * Shows entry count per month and highlights the current real month.
 */
function MonthSelector({ entries, selectedMonth, selectedYear, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Current real month/year in IST
    const now = useMemo(() => getNowIST(), []);
    const realMonth = now.getMonth() + 1;
    const realYear = now.getFullYear();

    // Extract unique month-year combos from entries with counts
    const options = useMemo(() => {
        const optMap = new Map();

        entries.forEach((entry) => {
            const [_, mm, yyyy] = entry.date.split('-');
            const m = parseInt(mm, 10);
            const y = parseInt(yyyy, 10);
            const key = `${m}-${y}`;

            if (!optMap.has(key)) {
                optMap.set(key, { month: m, year: y, key, count: 0 });
            }
            optMap.get(key).count += 1;
        });

        const opts = Array.from(optMap.values());

        // Ensure selected option is in list
        const currentKey = `${selectedMonth}-${selectedYear}`;
        if (!opts.find((o) => o.key === currentKey)) {
            opts.push({ month: selectedMonth, year: selectedYear, key: currentKey, count: 0 });
        }

        // Sort: Newest first
        opts.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });

        return opts;
    }, [entries, selectedMonth, selectedYear]);

    const currentKey = `${selectedMonth}-${selectedYear}`;
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
                    className={`flex items-center gap-2 bg-surface-800 border ${isOpen ? 'border-brand-500 ring-1 ring-brand-500/50' : 'border-surface-700 hover:border-surface-600'
                        } text-surface-100 pl-4 pr-3 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 ease-in-out outline-none w-full sm:w-auto min-w-[160px] justify-between`}
                >
                    <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-surface-400" />
                        {MONTH_NAMES[selectedOption.month - 1]} {selectedOption.year}
                        {selectedOption.month === realMonth && selectedOption.year === realYear && (
                            <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                Current
                            </span>
                        )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full mt-2 right-0 w-full sm:w-72 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down origin-top-right">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {options.map((opt) => {
                                const isSelected = opt.key === currentKey;
                                const isCurrent = opt.month === realMonth && opt.year === realYear;
                                return (
                                    <button
                                        key={opt.key}
                                        onClick={() => {
                                            onSelect(opt.month, opt.year);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ease-in-out ${isSelected
                                            ? 'bg-brand-500/10 text-brand-400'
                                            : 'text-surface-300 hover:bg-surface-700 hover:text-surface-100'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {MONTH_NAMES[opt.month - 1]} {opt.year}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-[9px] font-semibold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                                    Current
                                                </span>
                                            )}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="text-xs text-surface-500 tabular-nums">
                                                {opt.count} {opt.count === 1 ? 'entry' : 'entries'}
                                            </span>
                                            {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                                        </span>
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
