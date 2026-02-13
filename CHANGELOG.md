# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.0.4-dev] - 2026-02-14

### Changed (Phase 4 — Polish & Fixes)
- **UI/UX Polish:**
  - Removed version badge from Header (kept only in Footer)
  - Replaced text date input with **native date picker** (`type="date"`) in `AddEntryForm`
  - Fixed month selector dropdown arrow alignment
  - Enforced consistent fonts for numbers (`tabular-nums`) in tables and stats cards
  - Moved toast notifications to `top-center` for better visibility
  - Replaced simple spinner with a **modern animated double-ring spinner**
  - Added "App Shell" loading state (CSS spinner) to `index.html` to prevent white screen on slow loads
- **Code Quality:**
  - Enhanced `server.js` with detailed, non-coder-friendly console logs for requests and connections
  - Added structured logging to `entries.js` for all CRUD operations
  - Audited code for redundancy

---

## [0.0.3-dev] - 2026-02-14

### Added (Phase 3 — UI Components)
- Header component with gradient background
- AddEntryForm with inline validation, auto-dash date input, add/edit modes
- EntriesTable with daily increase column, invalid row highlighting, edit/delete actions
- MonthSelector dropdown auto-detecting available months
- MonthlyStatsCard with all stats, progress bar, and status badge
- StatusBadge component (SAFE/DANGER/WAITING/INVALID with color coding)
- Footer with copyright, credits, and auto version display
- ConfirmDialog for delete confirmations
- LoadingSpinner, ErrorFallback (with retry), EmptyState components
- Complete App.jsx assembly with all state management
- Constants module for shared config values
- Render deployment configuration (`render.yaml`)

---

## [0.0.2-dev] - 2026-02-14

### Added (Phase 2 — Core Logic & Services)
- `dateHelpers.js` — DD-MM-YYYY parsing, IST timezone, leap year, days-in-month
- `validation.js` — entry validation with cumulative constraint checking
- `calculations.js` — daily increase, monthly stats, status engine with NaN guards
- `api.js` — Axios service layer for CRUD operations
- `useEntries.js` — custom hook with state management and toast notifications
- Vite proxy configuration for dev API requests

---

## [0.0.1-dev] - 2026-02-14

### Added (Phase 1 — Foundation & Infrastructure)
- Project initialization with Vite + React
- TailwindCSS v3 with custom design system (brand colors, Inter font, shadows, animations)
- Express backend with MongoDB Atlas (Mongoose)
- Entry model with date (DD-MM-YYYY) and totalHours fields
- Full CRUD API routes (`/api/entries`)
- ThemeContext pre-wired for future dark/light mode toggle
- Root package.json with concurrently for simultaneous frontend + backend dev
- `.gitignore`, `.env.example`, `VERSION`, `README.md`
