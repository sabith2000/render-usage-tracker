import { FileQuestion } from 'lucide-react';

/**
 * EmptyState — shown when there are no entries for the selected month.
 *
 * @param {{ monthLabel: string }} props
 */
function EmptyState({ monthLabel }) {
    return (
        <div className="card p-12 text-center animate-fade-in border-dashed border-2 border-surface-700 bg-surface-800/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-800 mb-4 shadow-inner">
                <FileQuestion className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-200 mb-2">
                No Data Found
            </h3>
            <p className="text-surface-400 max-w-sm mx-auto">
                There are no usage entries for <span className="text-brand-300 font-medium">{monthLabel}</span>.
                Start by adding a new entry above.
            </p>
        </div>
    );
}

export default EmptyState;
