/**
 * EmptyState — shown when there are no entries for the selected month.
 *
 * @param {{ monthLabel: string }} props
 */
function EmptyState({ monthLabel }) {
    return (
        <div className="card p-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-500/10 mb-4">
                <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-100 mb-2">
                No entries yet
            </h3>
            <p className="text-surface-400 text-sm max-w-md mx-auto">
                No usage data recorded for <span className="text-surface-200 font-medium">{monthLabel}</span>.
                Add your first entry above to start tracking.
            </p>
        </div>
    );
}

export default EmptyState;
