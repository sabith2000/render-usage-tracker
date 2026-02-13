import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext(undefined);

const THEME_KEY = 'render-monitor-theme';

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            const stored = localStorage.getItem(THEME_KEY);
            return stored === 'light' ? 'light' : 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            // localStorage unavailable — silently ignore
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
