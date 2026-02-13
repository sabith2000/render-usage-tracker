import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Save, X, AlertCircle } from 'lucide-react';
import { validateEntry } from '../utils/validation.js';
import { getTodayIST, parseDate, formatDate } from '../utils/dateHelpers.js';

// Import local CSS if needed, but usually we import global CSS in main.jsx
// For now, we'll assume global import or add it here if it doesn't break HMR.
// import "react-datepicker/dist/react-datepicker.css"; 

/**
 * AddEntryForm — Form to add or edit an entry.
 * Now uses react-datepicker for robust date selection.
 *
 * @param {{
 *   onAdd: (entry: object) => Promise<void>,
 *   onUpdate: (id: string, entry: object) => Promise<void>,
 *   editEntry: object|null,
 *   onCancelEdit: () => void,
 * }} props
 */
function AddEntryForm({ onAdd, onUpdate, editEntry, onCancelEdit }) {
    const [form, setForm] = useState({
        date: getTodayIST(),
        totalHours: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (editEntry) {
            setForm({
                date: editEntry.date,
                totalHours: editEntry.totalHours.toString(),
            });
            setErrors({});
        } else {
            setForm({
                date: getTodayIST(),
                totalHours: '',
            });
        }
    }, [editEntry]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const { valid, errors: newErrors } = validateEntry(form);
        if (!valid) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            if (editEntry) {
                await onUpdate(editEntry._id, form);
            } else {
                await onAdd(form);
                // Reset form on success (keep today's date)
                setForm({ date: getTodayIST(), totalHours: '' });
            }
            setErrors({});
        } catch (err) {
            console.error(err);
            // Errors handled by parent/toast usually
        } finally {
            setIsSubmitting(false);
        }
    };

    // Convert DD-MM-YYYY string to Date object for the picker
    const selectedDate = parseDate(form.date) || new Date();

    return (
        <div className="card p-6 animate-slide-up shadow-glow mb-8 bg-surface-800/50 backdrop-blur-sm border border-surface-700/50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-surface-100 flex items-center gap-2">
                    {editEntry ? (
                        <>
                            <Save className="w-5 h-5 text-brand-400" />
                            Edit Entry
                        </>
                    ) : (
                        <>
                            <CalendarIcon className="w-5 h-5 text-brand-400" />
                            Add New Entry
                        </>
                    )}
                </h2>
                {editEntry && (
                    <button
                        onClick={onCancelEdit}
                        className="text-surface-400 hover:text-surface-200 transition-colors p-1"
                        title="Cancel Edit"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
                {/* Date Input */}
                <div className="space-y-2 relative z-10">
                    <label className="block text-sm font-medium text-surface-300">
                        Date
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                if (date) {
                                    setForm(prev => ({ ...prev, date: formatDate(date) }));
                                    if (errors.date) setErrors(prev => ({ ...prev, date: null }));
                                }
                            }}
                            dateFormat="dd-MM-yyyy"
                            className={`w-full bg-surface-900 border ${errors.date ? 'border-danger-500 focus:ring-danger-500' : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500'
                                } text-surface-100 rounded-lg pl-10 pr-4 py-2.5 shadow-sm transition-all focus:ring-2 outline-none font-sans`}
                            placeholderText="Select date"
                            showPopperArrow={false}
                        />
                        <CalendarIcon className="w-5 h-5 text-surface-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                    {errors.date && (
                        <p className="text-xs text-danger-400 mt-1 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-3 h-3" />
                            {errors.date}
                        </p>
                    )}
                </div>

                {/* Hours Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-300">
                        Total Usage (Cumulative)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            value={form.totalHours}
                            onChange={(e) => {
                                setForm({ ...form, totalHours: e.target.value });
                                if (errors.hours) setErrors(prev => ({ ...prev, hours: null }));
                            }}
                            className={`w-full bg-surface-900 border ${errors.hours ? 'border-danger-500 focus:ring-danger-500' : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500'
                                } text-surface-100 rounded-lg pl-4 pr-4 py-2.5 shadow-sm transition-all focus:ring-2 outline-none font-sans tabular-nums`}
                            placeholder="e.g. 104.42"
                        />
                    </div>
                    {errors.hours && (
                        <p className="text-xs text-danger-400 mt-1 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-3 h-3" />
                            {errors.hours}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-white shadow-lg transition-all transform active:scale-95 ${isSubmitting
                                ? 'bg-surface-600 cursor-not-allowed text-surface-300'
                                : editEntry
                                    ? 'bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/25'
                                    : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-brand-500/25'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : editEntry ? (
                            <>
                                <Save className="w-5 h-5" />
                                Update Entry
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Add Entry
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Global override styles for React Datepicker to match theme */}
            <style>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          font-family: 'Inter', sans-serif !important;
          background-color: #1e293b !important; /* surface-800 */
          border: 1px solid #334155 !important; /* surface-700 */
          border-radius: 0.75rem !important;
          color: #f1f5f9 !important; /* surface-100 */
        }
        .react-datepicker__header {
          background-color: #0f172a !important; /* surface-900 */
          border-bottom: 1px solid #334155 !important; /* surface-700 */
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
        }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
          color: #f1f5f9 !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day-name {
          color: #94a3b8 !important; /* surface-400 */
        }
        .react-datepicker__day {
          color: #cbd5e1 !important; /* surface-300 */
        }
        .react-datepicker__day:hover {
          background-color: #334155 !important; /* surface-700 */
          border-radius: 0.375rem !important;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
          background-color: #6366f1 !important; /* brand-500 */
          color: white !important;
          border-radius: 0.375rem !important;
        }
        .react-datepicker__day--today {
          font-weight: bold !important;
          color: #818cf8 !important; /* brand-400 */
        }
        .react-datepicker__day--disabled {
          color: #475569 !important; /* surface-600 */
        }
      `}</style>
        </div>
    );
}

export default AddEntryForm;
