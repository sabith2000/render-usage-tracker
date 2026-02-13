/**
 * LoadingSpinner — shown during API loading states.
 */
function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-surface-700" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
            </div>
            <p className="text-surface-400 text-sm mt-4">Loading entries...</p>
        </div>
    );
}

export default LoadingSpinner;
