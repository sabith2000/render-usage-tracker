/**
 * EntriesTable — displays entries for the selected month with daily increase.
 *
 * @param {{
 *   entriesWithIncrease: Array,
 *   onEdit: (entry: object) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function EntriesTable({ entriesWithIncrease, onEdit, onDelete }) {
    if (entriesWithIncrease.length === 0) {
        return null; // EmptyState handled by parent
    }

    return (
        <div className="card overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-surface-700">
                <h2 className="text-lg font-semibold text-surface-100">
                    📊 Entries ({entriesWithIncrease.length})
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-surface-850 text-surface-400 text-xs uppercase tracking-wider">
                            <th className="px-5 py-3 text-left font-medium">Date</th>
                            <th className="px-5 py-3 text-right font-medium">Total Hours</th>
                            <th className="px-5 py-3 text-right font-medium">Daily Increase</th>
                            <th className="px-5 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700/50">
                        {entriesWithIncrease.map((entry) => (
                            <tr
                                key={entry._id}
                                className={`transition-colors duration-150 hover:bg-surface-700/30 ${entry.isInvalid
                                        ? 'bg-warning-500/5 border-l-2 border-l-warning-500'
                                        : ''
                                    }`}
                            >
                                {/* Date */}
                                <td className="px-5 py-3">
                                    <span className="text-surface-200 font-mono text-sm">
                                        {entry.date}
                                    </span>
                                </td>

                                {/* Total Hours */}
                                <td className="px-5 py-3 text-right">
                                    <span className="text-surface-200 font-mono text-sm font-medium">
                                        {Number(entry.totalHours).toFixed(2)}
                                    </span>
                                    <span className="text-surface-500 text-xs ml-1">hrs</span>
                                </td>

                                {/* Daily Increase */}
                                <td className="px-5 py-3 text-right">
                                    {entry.dailyIncrease === '-' ? (
                                        <span className="text-surface-500 text-sm">—</span>
                                    ) : entry.isInvalid ? (
                                        <span className="text-warning-400 font-mono text-sm font-medium flex items-center justify-end gap-1">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {Number(entry.dailyIncrease).toFixed(2)}
                                        </span>
                                    ) : (
                                        <span className="text-success-400 font-mono text-sm">
                                            +{Number(entry.dailyIncrease).toFixed(2)}
                                        </span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(entry)}
                                            className="p-1.5 rounded-md hover:bg-surface-600 text-surface-400 hover:text-brand-400 transition-colors"
                                            title="Edit entry"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(entry._id)}
                                            className="p-1.5 rounded-md hover:bg-surface-600 text-surface-400 hover:text-danger-400 transition-colors"
                                            title="Delete entry"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EntriesTable;
