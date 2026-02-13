/**
 * EntriesTable — Displays list of entries.
 *
 * @param {{
 *   entriesWithIncrease: Array,
 *   onEdit: (entry: object) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function EntriesTable({ entriesWithIncrease, onEdit, onDelete }) {
    return (
        <div className="card overflow-hidden animate-slide-up shadow-glow" style={{ animationDelay: '100ms' }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-900/50 border-b border-surface-700">
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider text-right">Total (Cumulative)</th>
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider text-right">Daily Increase</th>
                            <th className="py-4 px-6 text-sm font-semibold text-surface-300 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800">
                        {entriesWithIncrease.map((entry) => {
                            const isInvalid = entry.dailyIncrease < 0;
                            return (
                                <tr
                                    key={entry._id}
                                    className={`group transition-colors ${isInvalid ? 'bg-danger-900/10 hover:bg-danger-900/20' : 'hover:bg-surface-700/30'
                                        }`}
                                >
                                    <td className="py-4 px-6 text-surface-200 font-medium whitespace-nowrap tabular-nums">
                                        {entry.date}
                                    </td>
                                    <td className="py-4 px-6 text-surface-200 text-right tabular-nums font-mono">
                                        {entry.totalHours.toFixed(2)}
                                    </td>
                                    <td className={`py-4 px-6 text-right tabular-nums font-mono font-medium ${isInvalid ? 'text-danger-400' : 'text-success-400'
                                        }`}>
                                        {isInvalid ? '⚠ ' : '+'}
                                        {entry.dailyIncrease.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(entry)}
                                                className="p-1.5 text-brand-300 hover:text-white hover:bg-brand-600 rounded-md transition-colors"
                                                title="Edit Entry"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onDelete(entry._id)}
                                                className="p-1.5 text-danger-400 hover:text-white hover:bg-danger-600 rounded-md transition-colors"
                                                title="Delete Entry"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EntriesTable;
