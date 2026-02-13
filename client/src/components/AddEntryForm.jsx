import { useState, useEffect } from 'react';
import { validateEntry, getFieldError } from '../utils/validation.js';
import { getTodayIST } from '../utils/dateHelpers.js';

/**
 * AddEntryForm — handles adding and editing entries with inline validation.
 *
 * @param {{
 *   onSubmit: (entry: { date: string, totalHours: number }) => Promise<boolean>,
 *   entries: Array,
 *   editingEntry: object|null,
 *   onCancelEdit: () => void,
 * }} props
 */
function AddEntryForm({ onSubmit, entries, editingEntry, onCancelEdit }) {
    const [date, setDate] = useState('');
    const [totalHours, setTotalHours] = useState('');
    const [touched, setTouched] = useState({ date: false, hours: false });
    const [submitting, setSubmitting] = useState(false);

    const isEditing = editingEntry !== null;

    // Pre-fill form when editing
    useEffect(() => {
        if (editingEntry) {
            setDate(editingEntry.date || '');
            setTotalHours(String(editingEntry.totalHours ?? ''));
            setTouched({ date: true, hours: true });
        } else {
            setDate('');
            setTotalHours('');
            setTouched({ date: false, hours: false });
        }
    }, [editingEntry]);

    // Validate in real-time
    const { valid, errors } = validateEntry(
        { date, totalHours },
        entries,
        isEditing ? editingEntry._id : null
    );

    const dateError = getFieldError(errors, touched, 'date');
    const hoursError = getFieldError(errors, touched, 'hours');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({ date: true, hours: true });

        if (!valid) return;

        setSubmitting(true);
        const success = await onSubmit({
            date: date.trim(),
            totalHours: Number(totalHours),
        });
        setSubmitting(false);

        if (success) {
            setDate('');
            setTotalHours('');
            setTouched({ date: false, hours: false });
        }
    };

    const handleCancel = () => {
        setDate('');
        setTotalHours('');
        setTouched({ date: false, hours: false });
        onCancelEdit();
    };

    /**
     * Handle date input — auto-insert dashes for DD-MM-YYYY format.
     */
    const handleDateChange = (e) => {
        let value = e.target.value.replace(/[^0-9-]/g, '');

        // Auto-insert dashes
        const digitsOnly = value.replace(/-/g, '');
        if (digitsOnly.length >= 4) {
            value = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4, 8)}`;
        } else if (digitsOnly.length >= 2) {
            value = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
        }

        setDate(value);
        if (!touched.date) setTouched((t) => ({ ...t, date: true }));
    };

    const handleHoursChange = (e) => {
        setTotalHours(e.target.value);
        if (!touched.hours) setTouched((t) => ({ ...t, hours: true }));
    };

    return (
        <div className="card p-5 animate-fade-in">
            <h2 className="text-lg font-semibold text-surface-100 mb-4">
                {isEditing ? '✏️ Edit Entry' : '➕ Add Entry'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date Input */}
                    <div>
                        <label htmlFor="entry-date" className="label">
                            Date (DD-MM-YYYY)
                        </label>
                        <input
                            id="entry-date"
                            type="text"
                            value={date}
                            onChange={handleDateChange}
                            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                            placeholder={getTodayIST()}
                            maxLength={10}
                            className={`input-field ${dateError ? 'input-error' : ''}`}
                            disabled={submitting}
                            autoComplete="off"
                        />
                        {dateError && <p className="error-text">{dateError}</p>}
                    </div>

                    {/* Total Hours Input */}
                    <div>
                        <label htmlFor="entry-hours" className="label">
                            Total Hours Used (Cumulative)
                        </label>
                        <input
                            id="entry-hours"
                            type="text"
                            value={totalHours}
                            onChange={handleHoursChange}
                            onBlur={() => setTouched((t) => ({ ...t, hours: true }))}
                            placeholder="e.g. 245.5"
                            className={`input-field ${hoursError ? 'input-error' : ''}`}
                            disabled={submitting}
                            autoComplete="off"
                        />
                        {hoursError && <p className="error-text">{hoursError}</p>}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={submitting || (touched.date && touched.hours && !valid)}
                        className="btn-primary"
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
