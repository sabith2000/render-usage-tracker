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
function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    onConfirm,
    onCancel,
    danger = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative card p-6 w-full max-w-sm animate-slide-up shadow-glow-lg">
                <h3 className="text-lg font-semibold text-surface-100 mb-2">{title}</h3>
                <p className="text-surface-400 text-sm mb-6">{message}</p>

                <div className="flex items-center justify-end gap-3">
                    <button onClick={onCancel} className="btn-ghost">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={danger ? 'btn-danger' : 'btn-primary'}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
