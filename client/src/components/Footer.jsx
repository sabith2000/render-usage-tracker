import { APP_VERSION } from '../utils/constants.js';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-12">
            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-700/60 to-transparent" />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-surface-500">
                    <p>© {year} Render Free Usage Monitor. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span>Made with ❤️ for the Render community</span>
                        <span className="text-xs font-mono bg-surface-800 px-2 py-0.5 rounded border border-surface-700 text-surface-400">
                            v{APP_VERSION}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
