/**
 * SkeletonLoader — Shimmer placeholder matching the real page layout.
 * Shows skeleton blocks for: form card, stats card, table rows.
 */
function SkeletonLoader() {
    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Form skeleton */}
            <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 p-6">
                <div className="h-6 w-36 bg-surface-700/60 rounded-lg mb-6 animate-shimmer" />
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="h-4 w-12 bg-surface-700/60 rounded animate-shimmer" />
                        <div className="h-10 bg-surface-700/40 rounded-lg animate-shimmer" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-surface-700/60 rounded animate-shimmer" />
                        <div className="h-10 bg-surface-700/40 rounded-lg animate-shimmer" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-transparent rounded" />
                        <div className="h-10 bg-brand-600/30 rounded-lg animate-shimmer" />
                    </div>
                </div>
            </div>

            {/* Month selector skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-10 w-48 bg-surface-700/40 rounded-lg animate-shimmer" />
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-surface-700/40 rounded-lg animate-shimmer" />
                    <div className="h-10 w-36 bg-surface-700/40 rounded-lg animate-shimmer" />
                </div>
            </div>

            {/* Stats card skeleton */}
            <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-40 bg-surface-700/60 rounded-lg animate-shimmer" />
                    <div className="h-8 w-24 bg-surface-700/40 rounded-full animate-shimmer" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 bg-surface-900/50 rounded-lg space-y-2">
                            <div className="h-3 w-20 bg-surface-700/60 rounded animate-shimmer" />
                            <div className="h-7 w-16 bg-surface-700/40 rounded animate-shimmer" />
                        </div>
                    ))}
                </div>
                {/* Progress bar skeleton */}
                <div className="mt-6">
                    <div className="h-2 bg-surface-700/40 rounded-full animate-shimmer" />
                </div>
            </div>

            {/* Table skeleton */}
            <div className="rounded-xl bg-surface-800/50 border border-surface-700/50 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-surface-700/50">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-4 bg-surface-700/60 rounded animate-shimmer" />
                    ))}
                </div>
                {/* Table rows */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-surface-700/30">
                        {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-4 bg-surface-700/30 rounded animate-shimmer"
                                style={{ animationDelay: `${(i * 4 + j) * 50}ms` }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SkeletonLoader;
