import { APP_VERSION } from '../utils/constants.js';

/**
 * Footer — Copyright, credits, and version info.
 */
function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-8 border-t border-surface-800 py-8 bg-surface-950/50">
            <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-surface-400 text-sm">
                    © {currentYear} Render Usage Monitor.
                </div>

                <span className="text-xs font-mono text-surface-500 bg-surface-900 px-2 py-1 rounded border border-surface-800">
                    v{APP_VERSION}
                </span>
            </div>
        </footer>
    );
}

export default Footer;
