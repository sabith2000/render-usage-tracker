import { useState, useEffect } from 'react';
import { validateEntry, getFieldError } from '../utils/validation.js';
import { getTodayIST } from '../utils/dateHelpers.js';

/**
 * AddEntryForm — handles adding and editing entries with inline validation.
 * Uses native date picker (YYYY-MM-DD) but communicates with app using DD-MM-YYYY.
 *
 * @param {{
 *   onSubmit: (entry: { date: string, totalHours: number }) => Promise<boolean>,
 *   entries: Array,
 *   editingEntry: object|null,
 *   onCancelEdit: () => void,
 * }} props
 */
function AddEntryForm({ onSubmit, entries, editingEntry, onCancelEdit }) {
    // Internal state uses YYYY-MM-DD for native date input compatibility
    const [date, setDate] = useState('');
    const [totalHours, setTotalHours] = useState('');
    const [touched, setTouched] = useState({ date: false, hours: false });
    const [submitting, setSubmitting] = useState(false);

    const isEditing = editingEntry !== null;

    // Convert DD-MM-YYYY -> YYYY-MM-DD for input value
    const toInputDate = (dmY) => {
        if (!dmY) return '';
        const parts = dmY.split('-'); // DD-MM-YYYY
        if (parts.length !== 3) return '';
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    // Convert YYYY-MM-DD -> DD-MM-YYYY for storage/validation
    const toStorageDate = (ymd) => {
        if (!ymd) return '';
        const parts = ymd.split('-'); // YYYY-MM-DD
        if (parts.length !== 3) return '';
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    // Pre-fill form when editing
    useEffect(() => {
        if (editingEntry) {
            setDate(toInputDate(editingEntry.date));
            setTotalHours(String(editingEntry.totalHours ?? ''));
            setTouched({ date: true, hours: true });
        } else {
            // Default to today in YYYY-MM-DD
            const today = new Date();
            const offset = today.getTimezoneOffset();
            const local = new Date(today.getTime() - offset * 60 * 1000);
            const ymd = local.toISOString().split('T')[0];
            setDate(ymd);
            setTotalHours('');
            setTouched({ date: false, hours: false });
        }
    }, [editingEntry]);

    // Validate using DD-MM-YYYY format
    const { valid, errors } = validateEntry(
        { date: toStorageDate(date), totalHours },
        entries,
        isEditing ? editingEntry._id : null
    );

    const dateError = getFieldError(errors, touched, 'date');
    const hoursError = getFieldError(errors, touched, 'hours');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ date: true, hours: true });

        if (!valid) return;

        setSubmitting(true);
        const success = await onSubmit({
            date: toStorageDate(date),
            totalHours: Number(totalHours),
        });
        setSubmitting(false);

        if (success) {
            if (!isEditing) {
                // Reset to today after success add
                const today = new Date();
                const offset = today.getTimezoneOffset();
                const local = new Date(today.getTime() - offset * 60 * 1000);
                setDate(local.toISOString().split('T')[0]);
                setTotalHours('');
                setTouched({ date: false, hours: false });
            }
        }
    };

    const handleCancel = () => {
        setDate('');
        setTotalHours('');
        setTouched({ date: false, hours: false });
        onCancelEdit();
    };

    return (
        <div className="card p-5 animate-fade-in shadow-glow">
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
                {isEditing ? '✏️ Edit Entry' : '➕ Add Entry'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Native Date Input */}
                    <div>
                        <label htmlFor="entry-date" className="label">
                            Date
                        </label>
                        <input
                            id="entry-date"
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                if (!touched.date) setTouched((t) => ({ ...t, date: true }));
                            }}
                            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                            className={`input-field ${dateError ? 'input-error' : ''} [color-scheme:dark]`}
                            disabled={submitting}
                            required
                        />
                        {dateError && <p className="error-text">{dateError}</p>}
                    </div>

                    {/* Total Hours Input */}
                    <div>
                        <label htmlFor="entry-hours" className="label">
                            Total Hours Used (Cumulative)
                        </label>
                        <div className="relative">
                            <input
                                id="entry-hours"
                                type="number"
                                step="0.01"
                                min="0"
                                value={totalHours}
                                onChange={(e) => {
                                    setTotalHours(e.target.value);
                                    if (!touched.hours) setTouched((t) => ({ ...t, hours: true }));
                                }}
                                onBlur={() => setTouched((t) => ({ ...t, hours: true }))}
                                placeholder="e.g. 245.5"
                                className={`input-field tabular-nums ${hoursError ? 'input-error' : ''}`}
                                disabled={submitting}
                                autoComplete="off"
                            />
                            <span className="absolute right-3 top-2.5 text-surface-500 text-sm pointer-events-none">
                                hrs
                            </span>
                        </div>
                        {hoursError && <p className="error-text">{hoursError}</p>}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={submitting || (touched.date && touched.hours && !valid)}
                        className="btn-primary flex-1 sm:flex-none justify-center"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : isEditing ? (
                            'Update Entry'
                        ) : (
                            'Add Entry'
                        )}
                    </button>

                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-ghost"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default AddEntryForm;
