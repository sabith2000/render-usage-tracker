import { X, Clock, ArrowRight } from 'lucide-react';

/**
 * HistoryModal — displays the edit history for a specific entry.
 *
 * @param {{
 *   isOpen: boolean,
 *   entry: object | null,
 *   onClose: () => void,
 * }} props
 */
function HistoryModal({ isOpen, entry, onClose }) {
    if (!isOpen || !entry) return null;

    const history = entry.history || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface-800 border border-surface-700 rounded-xl shadow-2xl p-6 w-full max-w-md animate-slide-up origin-center max-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-surface-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 rounded-full bg-brand-900/30">
                        <Clock className="w-6 h-6 text-brand-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-surface-100">
                            Edit History
                        </h3>
                        <p className="text-sm text-surface-400 font-sans">
                            Entry: {entry.date}
                        </p>
                    </div>
                </div>

                {/* History List */}
                {history.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-10 h-10 text-surface-600 mx-auto mb-3" />
                        <p className="text-surface-400 font-sans">No edit history</p>
                        <p className="text-surface-500 text-sm font-sans mt-1">
                            This entry has never been edited.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2 space-y-2">
                        {/* Current value */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-900/20 border border-brand-800/30">
                            <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="text-surface-200 font-medium tabular-nums font-sans">
                                    {entry.totalHours.toFixed(2)} hrs
                                </span>
                                <span className="text-xs text-brand-400 ml-2 font-sans">
                                    (current)
                                </span>
                            </div>
                        </div>

                        {/* Previous values (newest first) */}
                        {[...history].reverse().map((record, index) => {
                            const date = new Date(record.updatedAt);
                            const formatted = date.toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-700/30 border border-surface-700/50 hover:bg-surface-700/50 transition-colors"
                                >
                                    <div className="w-2 h-2 rounded-full bg-surface-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-surface-300 font-medium tabular-nums font-sans">
                                            {record.totalHours.toFixed(2)} hrs
                                        </span>
                                        <ArrowRight className="w-3 h-3 inline mx-2 text-surface-500" />
                                        <span className="text-surface-200 font-medium tabular-nums font-sans">
                                            {index === history.length - 1 - 0
                                                ? entry.totalHours.toFixed(2)
                                                : [...history].reverse()[index - 1]?.totalHours.toFixed(2) ?? '—'
                                            } hrs
                                        </span>
                                    </div>
                                    <span className="text-xs text-surface-500 font-sans whitespace-nowrap">
                                        {formatted}
                                    </span>
                                </div>
                            );
                        })}

                        <p className="text-xs text-surface-500 text-center pt-2 font-sans">
                            {history.length} edit{history.length !== 1 ? 's' : ''} tracked (max 20)
                        </p>
                    </div>
                )}

                {/* Close button */}
                <div className="mt-4 pt-4 border-t border-surface-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-lg transition-colors font-medium border border-surface-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HistoryModal;
