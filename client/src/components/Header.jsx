import { Activity } from 'lucide-react';

/**
 * Header — Top navigation bar with logo and title.
 * Gradient text effect for the brand name.
 */
function Header() {
    return (
        <header className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-md border-b border-surface-800">
            <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg shadow-lg shadow-brand-500/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Render
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400 ml-1.5">
                                Monitor
                            </span>
                        </h1>
                        <p className="text-[10px] text-surface-400 font-medium tracking-wide uppercase hidden sm:block">
                            Free Instance Usage Tracker
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
