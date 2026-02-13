import { AlertTriangle, Info, X } from 'lucide-react';

/**
 * ConfirmDialog — reusable confirmation modal.
 *
 * @param {{
 *   isOpen: boolean,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   danger?: boolean,
 * }} props
 */
function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm animate-fade-in"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-surface-800 border border-surface-700 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-slide-up origin-center">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-surface-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full mb-4 ${danger ? 'bg-danger-900/30' : 'bg-brand-900/30'
                        }`}>
                        {danger ? (
                            <AlertTriangle className={`w-8 h-8 ${danger ? 'text-danger-500' : 'text-brand-500'}`} />
                        ) : (
                            <Info className="w-8 h-8 text-brand-500" />
                        )}
                    </div>

                    <h3 className="text-xl font-semibold text-surface-100 mb-2">
                        {title}
                    </h3>
                    <p className="text-surface-400 mb-6 font-sans">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-lg transition-colors font-medium border border-surface-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-lg ${danger
                                    ? 'bg-danger-600 hover:bg-danger-500 shadow-danger-500/25'
                                    : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/25'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
