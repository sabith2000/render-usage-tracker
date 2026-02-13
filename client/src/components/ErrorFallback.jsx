/**
 * ErrorFallback — shown when API call fails, with retry button.
 *
 * @param {{ error: string, onRetry: () => void }} props
 */
function ErrorFallback({ error, onRetry }) {
    return (
        <div className="card p-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-danger-500/10 mb-4">
                <svg className="w-7 h-7 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-100 mb-2">
                Something went wrong
            </h3>
            <p className="text-surface-400 text-sm mb-6 max-w-md mx-auto">
                {error || 'An unexpected error occurred. Please try again.'}
            </p>
            <button onClick={onRetry} className="btn-primary">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                </span>
            </button>
        </div>
    );
}

export default ErrorFallback;
