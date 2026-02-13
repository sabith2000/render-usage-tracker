import { Github } from 'lucide-react';
import { APP_VERSION } from '../utils/constants.js'; // Ensure correct import path

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

                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/sabith2000" // Replace with actual user's Github if known
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-surface-400 hover:text-brand-400 transition-colors text-sm"
                    >
                        <Github className="w-4 h-4" />
                        <span>View on GitHub</span>
                    </a>

                    <span className="text-xs font-mono text-surface-500 bg-surface-900 px-2 py-1 rounded border border-surface-800">
                        v{APP_VERSION}
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
