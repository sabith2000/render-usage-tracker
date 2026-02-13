import { useState, useMemo } from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight, AlertCircle, Plus } from 'lucide-react';

/**
 * EntriesTable — Displays list of entries with pagination and actions.
 *
 * @param {{
 *   entriesWithIncrease: Array,
 *   onEdit: (entry: object) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function EntriesTable({ entriesWithIncrease, onEdit, onDelete }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalPages = Math.ceil(entriesWithIncrease.length / itemsPerPage);

    // Reset page if data shrinks
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const currentEntries = useMemo(() => {
        // Sort reverse chronological for table display? 
        // Usually tables show newest first. The data comes sorted chronological (oldest -> newest).
        // Let's reverse it for display so user sees latest entries first.
        const sorted = [...entriesWithIncrease].reverse();
        const start = (currentPage - 1) * itemsPerPage;
        return sorted.slice(start, start + itemsPerPage);
    }, [entriesWithIncrease, currentPage]);

    if (entriesWithIncrease.length === 0) {
        return null; // Should be handled by EmptyState, but safe guard
    }

    return (
        <div className="card overflow-hidden animate-slide-up shadow-glow flex flex-col h-full" style={{ animationDelay: '100ms' }}>
            <div className="overflow-x-auto custom-scrollbar flex-grow">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-900/50 border-b border-surface-700">
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider font-sans">Date</th>
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider text-right font-sans">Total (Cumulative)</th>
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider text-right font-sans">Daily Increase</th>
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider text-right font-sans">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800">
                        {currentEntries.map((entry) => {
                            const isInvalid = entry.dailyIncrease < 0;
                            return (
                                <tr
                                    key={entry._id}
                                    className={`group transition-colors ${isInvalid ? 'bg-danger-900/10 hover:bg-danger-900/20' : 'hover:bg-surface-700/30'
                                        }`}
                                >
                                    <td className="py-4 px-6 text-surface-200 font-medium whitespace-nowrap tabular-nums font-sans">
                                        {entry.date}
                                    </td>
                                    <td className="py-4 px-6 text-surface-200 text-right tabular-nums font-sans">
                                        {entry.totalHours.toFixed(2)}
                                    </td>
                                    <td className={`py-4 px-6 text-right tabular-nums font-sans font-medium ${isInvalid ? 'text-danger-400' : 'text-success-400'
                                        }`}>
                                        {isInvalid ? <AlertCircle className="w-4 h-4 inline mr-1" /> : (entry.dailyIncrease > 0 ? '+' : '')}
                                        {typeof entry.dailyIncrease === 'number'
                                            ? entry.dailyIncrease.toFixed(2)
                                            : entry.dailyIncrease}
                                    </td>
                                    <td className="py-4 px-6 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => onEdit(entry)}
                                                className="p-2 text-brand-300 hover:text-white hover:bg-brand-600 rounded-lg transition-colors"
                                                title="Edit Entry"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(entry._id)}
                                                className="p-2 text-danger-400 hover:text-white hover:bg-danger-600 rounded-lg transition-colors"
                                                title="Delete Entry"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="border-t border-surface-800 p-4 flex items-center justify-between bg-surface-900/30">
                    <div className="text-sm text-surface-400 font-sans">
                        Page <span className="font-medium text-surface-200">{currentPage}</span> of <span className="font-medium text-surface-200">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EntriesTable;
