/**
 * LoadingSpinner — Modern CSS-only animated spinner.
 * Shows a sleek, pulsing double-ring effect.
 */
function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in w-full">
            <div className="relative w-16 h-16">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-surface-800 opacity-20" />
                {/* Inner spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 border-r-brand-500 animate-spin" />
                {/* Pulsing core */}
                <div className="absolute inset-4 rounded-full bg-brand-500/10 animate-pulse" />
            </div>
            <p className="text-surface-400 text-sm mt-6 font-medium animate-pulse">
                Loading data...
            </p>
        </div>
    );
}

export default LoadingSpinner;
