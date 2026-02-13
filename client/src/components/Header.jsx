import { APP_VERSION } from '../utils/constants.js';

function Header() {
    return (
        <header className="relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900/50 via-surface-900 to-brand-900/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent" />

            <div className="relative max-w-5xl mx-auto px-4 py-6 sm:py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                            Render Free Usage Monitor
                        </h1>
                        <p className="text-surface-400 text-sm mt-1">
                            Track your monthly free instance hours (750 hrs/month)
                        </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        <span className="text-xs font-mono bg-surface-800 text-surface-400 px-2.5 py-1 rounded-full border border-surface-700">
                            v{APP_VERSION}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom border glow */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
        </header>
    );
}

export default Header;
