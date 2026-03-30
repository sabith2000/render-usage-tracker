# Render Free Usage Monitor — Project Context

> **Version:** 0.0.14-dev
> **Last Updated:** 2026-03-31
> **Purpose:** This file is the single source of truth for understanding, maintaining, and extending this project. Any AI agent or developer **MUST read this file in full** before making changes.

---

## 1. 🧠 Project Overview

### What This Is
A single-page web application that tracks monthly **cumulative free instance hours** on [Render.com](https://render.com) (which gives 750 free hours per month). Users manually log their Render dashboard reading each day, and the app calculates daily increases, averages, projections, and remaining hours with a rich dark-themed UI.

### Core Purpose
- **Manual usage logging** — Users enter the cumulative hour value from their Render dashboard
- **Monthly analytics** — Daily average, projected total, remaining buffer, SAFE/WARNING/DANGER status
- **Historical audit trail** — Every edit is tracked (last 20 versions per entry)
- **Multi-month browsing** — View and compare data across months

### Key Philosophy
- **Simple & focused** — This is a personal utility tool, not a multi-user SaaS
- **Single-user model** — No authentication, no user accounts. All data belongs to one user
- **Server-dependent** — NOT an offline-first app. All data lives in MongoDB. Frontend fetches on load
- **Dark theme only** — The UI is purpose-built for a dark indigo/slate aesthetic
- **Manual data entry** — There is NO automatic scraping or API integration with Render.com

---

## 2. 🏗️ Architecture

### High-Level Diagram

```
┌──────────────────────────────────┐
│          Client (React)          │
│  Vite + TailwindCSS v3 + Axios  │
│  Port 5173 (dev) / static (prod)│
└──────────────┬───────────────────┘
               │  HTTP (Axios, /api prefix)
               │  Proxy in dev: Vite → localhost:5000
               │
┌──────────────▼───────────────────┐
│        Server (Express)          │
│  Node.js + Mongoose + CORS (dev) │
│  Port 5000                       │
└──────────────┬───────────────────┘
               │  Mongoose ODM
               │
┌──────────────▼───────────────────┐
│       MongoDB Atlas (Cloud)      │
│  Database: render-usage-monitor  │
│  Collection: entries             │
└──────────────────────────────────┘
```

### Frontend Stack
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.x | UI framework |
| Vite | 7.3.x | Build tool + dev server |
| TailwindCSS | 3.4.x | Utility-first CSS (dark mode via `class` strategy) |
| Axios | 1.13.x | HTTP client for API calls |
| react-datepicker | 9.1.x | Calendar date input |
| lucide-react | 0.564.x | Icon library |
| react-hot-toast | 2.6.x | Toast notifications |

### Backend Stack
| Technology | Version | Purpose |
|---|---|---|
| Express | 4.21.x | API server |
| Mongoose | 8.12.x | MongoDB ODM |
| dotenv | 16.4.x | Environment variable loading |
| cors | 2.8.x | Cross-origin support (dev only) |

### Deployment
| Aspect | Detail |
|---|---|
| Platform | Render.com (Free tier) |
| Type | Single Web Service |
| Region | Singapore |
| Node | 22.12.0 |
| Build | `cd client && npm install --include=dev && npm run build && cd ../server && npm install` |
| Start | `cd server && npm start` |
| Static serving | Express serves `client/dist/` as static files in production |
| SPA fallback | Express catch-all route serves `index.html` for non-API paths |

### Critical Deployment Behavior: Render Free Tier Cold Starts
- Render free services **spin down after 15 minutes of inactivity**
- First request after inactivity triggers a **cold start (30–90 seconds)**
- During cold start, the frontend shows a CSS-only spinner from `index.html`
- There is a **10-second Axios timeout** on API calls (`api.js`)
- If cold start exceeds 10s, the user sees a network error toast — they must retry

---

## 3. 🔁 Core Systems Explained

### Data Flow (Add Entry)

```
1. User fills date + totalHours in AddEntryForm
2. Client-side validation (validation.js):
   - Date: not empty, valid DD-MM-YYYY, not future, not duplicate
   - Hours: not empty, >= 0, month-scoped cumulative constraint
3. Form calls onAdd(entry) → useEntries.addEntry()
4. Axios POST /api/entries → Express router
5. Server checks duplicate date in MongoDB
6. Mongoose validates & saves
7. Response returns saved document
8. Client adds to state array, sorts chronologically
9. Toast: "Entry for DD-MM-YYYY added successfully"
```

### Data Flow (Edit Entry)

```
1. User clicks Edit → form populates with existing data
2. Validation runs same as above (passing editingId to skip self-duplicate check)
3. Form calls onUpdate(id, entry) → useEntries.updateEntry()
4. Axios PUT /api/entries/:id → Express router
5. Server snapshots current totalHours into history[] (capped at 20)
6. Server updates date + totalHours
7. Response returns updated document
8. Client replaces entry in state, re-sorts
9. Form exits edit mode (onCancelEdit)
10. Toast: "Entry updated successfully"
```

### Date Format
- **Internal format:** `DD-MM-YYYY` (stored in MongoDB as String)
- **Sorting:** Converted to `YYYY-MM-DD` for `localeCompare` sorting
- **Timezone:** All "today" logic uses IST (UTC+5:30) via manual offset calculation in `dateHelpers.js`
- **Date picker:** `react-datepicker` with format `dd-MM-yyyy`, converted to/from DD-MM-YYYY strings

### Month-Scoped Validation (CRITICAL)
Cumulative hours must be non-decreasing **within the same month only**:
- If adding an entry on `15-03-2026` with entries on `10-03-2026 (100 hrs)` and `20-03-2026 (200 hrs)`:
  - Hours must be `>= 100` (previous entry in same month)
  - Hours must be `<= 200` (next entry in same month)
- The **first entry of a new month** has **no floor constraint** — any `>= 0` value works
- Cross-month entries do NOT affect each other's validation

### Monthly Statistics Engine (`calculations.js`)
- **With 0 entries:** All zeros, status = WAITING
- **With 1 entry:** Shows current total, remaining = 750 - total, projected = total, status = SAFE
- **With 2+ entries:** Calculates:
  - `dailyAverage = (latest - first) / daysBetween`
  - `projectedTotal = dailyAverage × daysInMonth` (simple linear)
  - `remainingHours = 750 - latestTotal`
  - Status thresholds:
    - `SAFE` — projected < 675 (90% of 750)
    - `WARNING` — projected >= 675 but < 750
    - `DANGER` — projected >= 750
    - `INVALID DATA` — any negative daily increase detected

### Edit History System
- Each Entry document has a `history[]` sub-array
- On PUT, the **current** totalHours value is pushed into history before applying the update
- Capped at 20 records using MongoDB `$slice: -20`
- History is displayed in a modal (`HistoryModal.jsx`) with newest edits first
- The History icon only appears in the table for entries that have been edited

### Export System
- Client-side only (no server endpoint)
- Generates a JSON file with all entries + their history
- File named: `render-usage-export-YYYY-MM-DD.json`
- Triggered via Blob + `<a>` click download pattern

### Clear All
- Deletes entries one-by-one via parallel `Promise.all(entries.map(api.deleteEntry))`
- On partial failure, refetches all entries to re-sync UI state
- There is **NO bulk delete endpoint** on the server

---

## 4. 📁 Project Structure

```
usage-monitoring/
├── client/                          # React frontend (Vite)
│   ├── index.html                   # HTML shell with CSS-only initial loader
│   ├── package.json                 # Client dependencies
│   ├── vite.config.js               # Vite config with /api proxy to :5000
│   ├── tailwind.config.js           # Custom design system (brand/surface/status colors)
│   ├── postcss.config.js            # PostCSS with TailwindCSS + Autoprefixer
│   ├── eslint.config.js             # ESLint flat config for React
│   ├── public/
│   │   └── favicon.svg              # Custom indigo pulse-line SVG favicon
│   └── src/
│       ├── main.jsx                 # App entry: React.StrictMode + ThemeProvider + Toaster
│       ├── App.jsx                  # Main component: state orchestration, layout, modals
│       ├── index.css                # Global styles: Tailwind directives, component classes, scrollbar
│       ├── components/
│       │   ├── Header.jsx           # Sticky navbar with gradient logo
│       │   ├── Footer.jsx           # Version badge + copyright
│       │   ├── AddEntryForm.jsx     # Date picker + hours input, add/edit modes
│       │   ├── EntriesTable.jsx     # Paginated table (10/page), reverse chronological
│       │   ├── MonthSelector.jsx    # Custom dropdown with entry counts per month
│       │   ├── MonthlyStatsCard.jsx # Stats grid + sparkline + progress bar
│       │   ├── StatusBadge.jsx      # SAFE/WARNING/DANGER/WAITING pill badge
│       │   ├── MonthTransitionBanner.jsx  # Banner when starting a new month
│       │   ├── HistoryModal.jsx     # Edit history timeline modal
│       │   ├── ConfirmDialog.jsx    # Reusable confirmation dialog
│       │   ├── LoadingSpinner.jsx   # Shimmer skeleton loader (NOT a spinner)
│       │   ├── EmptyState.jsx       # No-data placeholder
│       │   └── ErrorFallback.jsx    # Error display with retry button
│       ├── context/
│       │   └── ThemeContext.jsx      # Dark/light mode (currently dark-only, pre-wired)
│       ├── hooks/
│       │   └── useEntries.js        # CRUD state management + toast notifications
│       ├── services/
│       │   └── api.js               # Axios instance, CRUD functions, error extraction
│       └── utils/
│           ├── constants.js         # APP_VERSION, FREE_HOUR_LIMIT (750), STATUS_COLORS
│           ├── dateHelpers.js       # DD-MM-YYYY parse/format, IST timezone, month utilities
│           ├── validation.js        # Entry validation with month-scoped cumulative constraint
│           └── calculations.js      # dailyIncrease, monthlyStats, sparkline data, projections
│
├── server/                          # Express backend
│   ├── server.js                    # Entry point: middleware, routes, static serving, DB connect
│   ├── package.json                 # Server dependencies
│   ├── .env                         # Environment variables (gitignored)
│   ├── models/
│   │   └── Entry.js                 # Mongoose schema: date (DD-MM-YYYY), totalHours, history[]
│   ├── routes/
│   │   └── entries.js               # CRUD API: GET/POST/PUT/DELETE /api/entries
│   └── utils/
│       └── logger.js                # Environment-aware logger (file in dev, console-only in prod)
│
├── logs/                            # Development-only log output
│   └── server.log                   # Verbose request/CRUD logs (dev mode only)
│
├── package.json                     # Root workspace: scripts, concurrently
├── render.yaml                      # Render.com deployment blueprint
├── CHANGELOG.md                     # Keep-a-Changelog format version history
├── README.md                        # Quick-start documentation
├── VERSION                          # Plain-text version file
├── .env.example                     # Template for server/.env
└── .gitignore                       # Ignores: node_modules, .env, dist, logs
```

---

## 5. ⚙️ Environment & Config

### Environment Variables

| Variable | Location | Required | Description |
|---|---|---|---|
| `MONGODB_URI` | `server/.env` | Yes | MongoDB Atlas connection string |
| `PORT` | `server/.env` | No | Server port (default: 5000) |
| `NODE_ENV` | Render env | Auto | Set to `production` on Render |
| `NODE_VERSION` | Render env | Auto | Node.js version (22.12.0) |

### Build Process
```bash
# Development (runs both client + server concurrently)
npm run dev

# Production build (client → dist/, install server deps)
npm run build

# Production start (serves from server)
npm start
```

### Important Configuration Details
- **Vite proxy:** `/api` → `http://localhost:5000` (dev only)
- **CORS:** Enabled only when `NODE_ENV !== 'production'`
- **Base URL in production:** Same origin (no proxy, no CORS needed)
- **Axios baseURL:** `/api` (relative — works in both dev and prod)
- **Axios timeout:** 10,000ms (10 seconds)

---

## 6. 📦 Dependencies

### Frontend Dependencies (Production)

| Package | Why It's Used |
|---|---|
| `react` / `react-dom` | Core UI framework (v19) |
| `axios` | HTTP client with timeout/interceptor support |
| `react-datepicker` | Rich calendar input replacing native `<input type="date">` |
| `lucide-react` | Consistent icon set (replaced inline SVGs in v0.0.6) |
| `react-hot-toast` | Non-blocking toast notifications |

### Frontend Dependencies (Dev)

| Package | Why It's Used |
|---|---|
| `vite` | Build tool + HMR dev server |
| `@vitejs/plugin-react` | Vite React plugin (Babel-based Fast Refresh) |
| `tailwindcss` | Utility-first CSS framework (v3, `class` dark mode) |
| `postcss` + `autoprefixer` | CSS processing pipeline |
| `eslint` + plugins | Code quality (React hooks rules, refresh validation) |

### Backend Dependencies

| Package | Why It's Used |
|---|---|
| `express` | HTTP server and routing |
| `mongoose` | MongoDB ODM with schema validation |
| `cors` | Cross-origin resource sharing (dev mode only) |
| `dotenv` | Load `.env` file into `process.env` |

### Root Dependencies

| Package | Why It's Used |
|---|---|
| `concurrently` | Run client + server dev servers simultaneously |

---

## 7. 🚨 Critical Rules

> **Every future AI agent or developer MUST follow these rules without exception.**

### 7.1 — Do Not Break Existing Functionality
- The app currently works end-to-end. Any change must preserve:
  - CRUD operations (add, edit, delete, clear all)
  - Validation behavior (especially month-scoped cumulative constraint)
  - Statistics calculations (daily increase, average, projection, status)
  - Export functionality
  - Edit history tracking

### 7.2 — Validation Logic is Sacred
- `validation.js` implements **month-scoped cumulative validation**
- This was a critical bug fix (v0.0.11-dev): cross-month contamination was causing false validation failures
- **NEVER** remove the month-scoping logic or revert to global cumulative checks

### 7.3 — Date Format Consistency
- The app uses `DD-MM-YYYY` everywhere: database, API, frontend, validation
- **Do NOT** switch to ISO 8601 or any other format without a full migration plan
- The date is stored as a **String** in MongoDB (not Date type). This is intentional.

### 7.4 — Single-User Design
- There is NO authentication and NO user IDs in the data model
- All entries belong to a single implicit user
- Do NOT add auth/user-scoping without explicit approval

### 7.5 — IST Timezone
- All "today" and "future date" checks use IST (UTC+5:30)
- The timezone offset is hardcoded in `dateHelpers.js`
- Do NOT use `new Date()` directly for date comparisons — use `getNowIST()`

### 7.6 — Version Number Synchronization
- Version MUST be synchronized across these 5 locations:
  1. `package.json` (root) → `version` field
  2. `VERSION` file
  3. `README.md` → title line
  4. `client/src/utils/constants.js` → `APP_VERSION`
  5. `CHANGELOG.md` → latest entry header
- **All 5 must match** after any version bump

### 7.7 — No Unnecessary Rewrites
- The codebase is compact and intentionally simple
- Prefer targeted, minimal changes over sweeping refactors
- Every component is small and focused — keep it that way

### 7.8 — Preserve UI/UX Consistency
- Dark theme using brand (indigo) / surface (slate) / status color tokens
- Inter font family everywhere
- `tabular-nums` for all numeric displays
- Animations: `fade-in`, `slide-up`, `slide-down`, `scale-in`, `shimmer`
- Toast position: `top-center`

---

## 8. 🧪 Testing Guidelines

> There are **no automated tests** in this project. All testing is manual.

### Scenarios That MUST Be Verified After Changes

#### Data Entry
- [ ] Add new entry with valid date/hours → success toast, appears in table
- [ ] Add entry with duplicate date → validation error shown
- [ ] Add entry with future date → validation error
- [ ] Add entry with hours < previous entry (same month) → validation error
- [ ] Add first entry of a new month with any >= 0 value → succeeds (no cross-month constraint)

#### Edit Flow
- [ ] Click Edit → form populates with existing values
- [ ] Update hours → old value appears in history
- [ ] Cancel edit → form resets to "Add" mode
- [ ] Edit to duplicate date → validation error

#### Delete Flow
- [ ] Delete single entry → confirm dialog → success
- [ ] Clear All → confirm dialog → all entries removed
- [ ] Delete entry being edited → edit mode cancelled

#### Statistics
- [ ] 0 entries → WAITING status, zeros
- [ ] 1 entry → SAFE status, remaining = 750 - total, no daily average
- [ ] 2+ entries → correct daily avg, projection, remaining, sparkline
- [ ] Negative daily increase → INVALID DATA status, red row highlight

#### Month Navigation
- [ ] MonthSelector shows all months with entries
- [ ] Current month labeled "Current"
- [ ] Entry count per month is accurate
- [ ] Switching months → stats/table update correctly
- [ ] New empty month with previous month data → MonthTransitionBanner appears

#### Export
- [ ] Export Data → downloads JSON file with all entries + history
- [ ] Export with 0 entries → error toast

#### Network/Error States
- [ ] Server offline → error fallback with retry button
- [ ] Slow server (cold start) → skeleton loader shown
- [ ] Request timeout (>10s) → timeout error toast

---

## 9. 🔄 Versioning System

### Semantic Versioning: `MAJOR.MINOR.PATCH-PRERELEASE`

| Type | When |
|---|---|
| **PATCH** (0.0.X) | Bug fixes, no behavior change |
| **MINOR** (0.X.0) | New features, backward compatible |
| **MAJOR** (X.0.0) | Breaking changes, data model changes |
| **-dev** suffix | Pre-release/development builds |

### Current Version: `0.0.11-dev`

The `-dev` suffix indicates this is still in pre-release development. Once the project reaches feature-stable status, it should be promoted to `1.0.0`.

### Version Storage Locations
1. `package.json` → `"version": "0.0.11-dev"`
2. `VERSION` → `0.0.11-dev`
3. `README.md` → `# Render Free Usage Monitor (v0.0.11-dev)`
4. `client/src/utils/constants.js` → `export const APP_VERSION = '0.0.11-dev';`
5. `CHANGELOG.md` → `## [0.0.11-dev] - 2026-03-02`

---

## 10. 📝 Update Protocol

> **Every future change MUST follow this protocol.**

### Before Making Changes
1. Read this `context.md` file completely
2. Understand the impact surface:
   - Does it touch validation? → Test month-scoped constraint
   - Does it touch calculations? → Verify all stat formulas
   - Does it touch API routes? → Verify CRUD still works
   - Does it touch the data model? → Consider migration implications
   - Does it touch the UI? → Verify dark theme consistency

### Making Changes
3. Implement the change with minimal footprint
4. Follow existing code patterns (see coding style below)
5. Verify manually against the testing checklist (Section 8)

### After Making Changes
6. **Bump version** in all 5 locations (Section 9)
7. **Update `CHANGELOG.md`** with a dated entry listing Added/Fixed/Changed
8. **Update `README.md`** if features/setup instructions changed
9. **Update this `context.md`** if architecture, patterns, or rules changed
10. **Commit** with descriptive message referencing the version

> 📎 **For the complete release pipeline** (git workflow, Render deployment, safety checks), see **Section 17 — Deployment & Release Workflow**.

### Coding Style Conventions
- **Frontend:**
  - Functional components only (no class components)
  - `useCallback` / `useMemo` for performance-sensitive areas
  - Named exports for hooks and utilities, default exports for components
  - JSDoc comments on exported functions
  - File names: PascalCase for components, camelCase for utilities
- **Backend:**
  - ES Modules (`import`/`export`, `"type": "module"`)
  - Express Router pattern for routes
  - Async/await with try/catch
  - Logger for all operations (never bare `console.log`)
  - User-friendly error messages in JSON responses

---

## 11. 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full, detailed version history.

### Summary of Version Progression

| Version | Date | Milestone |
|---|---|---|
| 0.0.1 | 2026-02-14 | Foundation: Vite + React + Express + MongoDB |
| 0.0.2 | 2026-02-14 | Core logic: validation, calculations, API service |
| 0.0.3 | 2026-02-14 | All UI components, Render deployment config |
| 0.0.4 | 2026-02-14 | UX polish: native date picker, toast position, loading states |
| 0.0.5 | 2026-02-14 | Selective logging (file vs console) |
| 0.0.6 | 2026-02-14 | UI overhaul: react-datepicker, lucide icons, pagination |
| 0.0.7 | 2026-02-14 | Strict cumulative validation, UI fixes |
| 0.0.8 | 2026-02-14 | Date picker portal fix, edit mode reset fix |
| 0.0.9 | 2026-02-20 | History tracking, export, sparkline, trend indicator |
| 0.0.10 | 2026-02-20 | Deployment readiness: favicon, CORS, logger, cleanup |
| 0.0.11 | 2026-03-02 | Month-scoped validation fix, skeleton loaders, month transition banner |
| 0.0.12 | 2026-03-31 | AI context document (`context.md`), deployment & release workflow |
| 0.0.13 | 2026-03-31 | Version sync, file rename, healthcheck endpoint, last-synced UI, constant fix |
| 0.0.14 | 2026-03-31 | Axios timeout+retry, date picker overlap fix, history modal logic fix |

---

## 12. 🤖 AI Agent Instructions

> These instructions are specifically for future AI agents working on this codebase.

### Before ANY Change
1. **Read `context.md` (this file) first** — no exceptions
2. **Read `CHANGELOG.md`** to understand recent changes
3. **Verify assumptions in code** — never assume behavior; open the file and check

### Decision-Making Principles
4. **Prefer minimal, safe changes** — smallest diff that achieves the goal
5. **Preserve UX consistency** — match existing colors, fonts, animations, spacing
6. **Handle async + network states carefully**:
   - Loading → show skeleton/spinner
   - Error → show error fallback with retry
   - Success → show toast
   - Never leave the UI in a stale or dead state
7. **Never fake success states** — if an API call fails, the UI must reflect failure
8. **Respect the validation hierarchy** — client validates first, server validates second
9. **Consider Render cold starts** — users may experience 30-90s delays on first load

### Common Gotchas
10. `APP_VERSION` in `constants.js` is displayed in the Footer — update it!
11. The `totalHours` field is cumulative, NOT daily usage — don't confuse them
12. Dates are strings (`DD-MM-YYYY`), not JavaScript Date objects in the database
13. `LoadingSpinner.jsx` is actually a **SkeletonLoader** component (name is legacy)
14. The `clearAll` function deletes entries one-by-one — there is no bulk delete endpoint
15. `ThemeContext` is pre-wired but only dark mode is implemented/tested
16. The table shows entries in **reverse chronological** order (newest first) even though data is sorted oldest-first
17. History records are stored in the `history[]` array but the **current value** is in `totalHours` (not in history)

### What NOT to Do
- ❌ Do NOT add authentication without explicit request
- ❌ Do NOT change the date format without a migration plan
- ❌ Do NOT add a bulk delete endpoint without considering data safety
- ❌ Do NOT remove CORS middleware (it's needed in development)
- ❌ Do NOT use `console.log` in server code — use the `logger`
- ❌ Do NOT hardcode colors — use the Tailwind design tokens
- ❌ Do NOT install TailwindCSS v4 — the project uses v3 with `class` dark mode

---

## 13. 🧩 Known Issues / Tech Debt

### Known Issues
1. **Date Picker Overlap:** On some screen sizes, the react-datepicker calendar may overlap with the MonthSelector dropdown. The `portalId="root"` and `strategy="fixed"` mitigations help but may not cover all edge cases.
2. **Clear All Performance:** Deleting entries one-by-one via parallel API calls is not efficient for large datasets. Currently acceptable since typical usage is ~30 entries/month.
3. **Cold Start UX:** The 10-second Axios timeout may be shorter than Render's cold start time. Users may see a timeout error and need to retry manually.
4. **History Modal Display Logic:** The "from → to" display in HistoryModal has complex index calculation (`index === history.length - 1 - 0`) that may produce incorrect transitions for some edge cases.

### Tech Debt
1. **No automated tests** — There are zero unit or integration tests. All verification is manual.
2. **Client-side `package.json` version** — The `client/package.json` has `"version": "0.0.0"` and is not updated with the project version (only the root is).
3. **`LoadingSpinner.jsx` naming** — File is named `LoadingSpinner.jsx` but exports `SkeletonLoader`. The import in `App.jsx` already uses the correct component name but the filename is misleading.
4. **`ThemeContext` unused** — The theme toggle is wired up but there is no light mode implementation and no toggle button in the UI.
5. **FREE_HOUR_LIMIT hardcoded** — The 750-hour limit is defined in `constants.js` but also hardcoded as `{750}` in `MonthlyStatsCard.jsx` line 237.
6. **Server `client/package.json` version** — `server/package.json` has `"version": "0.0.1"`, not synced with project version.

---

## 14. 💡 Recommendations (Non-Breaking)

> These are observations from the code review. **No code has been modified.** Implement only if explicitly requested.

### Performance
1. **Add a bulk delete endpoint** (`DELETE /api/entries/bulk` or `DELETE /api/entries`) to replace the N individual delete calls in `clearAll`.
2. **Consider React Query or SWR** for data fetching to get caching, background refresh, and optimistic updates for free.

### Reliability
3. **Increase Axios timeout** to 30-60 seconds to accommodate Render cold starts, or implement a retry-with-backoff mechanism.
4. **Add a healthcheck endpoint** (`GET /api/health`) for uptime monitoring and pre-warming.

### UX
5. **Rename `LoadingSpinner.jsx`** to `SkeletonLoader.jsx` to match its actual content.
6. **Use `FREE_HOUR_LIMIT` constant** in `MonthlyStatsCard.jsx` instead of the hardcoded `750`.
7. **Add keyboard navigation** support to the custom MonthSelector dropdown (currently mouse-only).
8. **Add a "last synced" timestamp** in the UI so users know when data was last fetched.

### Code Quality
9. **Add basic test coverage** — at minimum, unit tests for `validation.js`, `calculations.js`, and `dateHelpers.js`.
10. **Consolidate version management** — consider a single source of truth file (e.g., the root `package.json`) and auto-derive others during build.
11. **TypeScript migration** — the project uses `@types/react` already. TypeScript would catch date format bugs and type mismatches at build time.

### Data Safety
12. **Add an import endpoint** — complement the export feature with the ability to restore from a previously exported JSON file.
13. **Add MongoDB backup scheduling** — MongoDB Atlas free tier supports scheduled backups; ensure it's enabled.

---

## 15. 📐 API Reference

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://<render-service-name>.onrender.com/api`

### Endpoints

#### `GET /api/entries`
Returns all entries sorted chronologically.

**Response:** `200 OK`
```json
[
  {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "date": "15-03-2026",
    "totalHours": 145.5,
    "history": [
      { "totalHours": 140.2, "updatedAt": "2026-03-15T10:30:00.000Z" }
    ],
    "createdAt": "2026-03-15T08:00:00.000Z",
    "updatedAt": "2026-03-15T10:30:00.000Z"
  }
]
```

#### `POST /api/entries`
Create a new entry. Returns `400` if date already exists.

**Request Body:**
```json
{ "date": "16-03-2026", "totalHours": 150.75 }
```

**Response:** `201 Created` → saved entry object

#### `PUT /api/entries/:id`
Update an existing entry. Automatically snapshots previous value into `history[]`.

**Request Body:**
```json
{ "date": "16-03-2026", "totalHours": 155.20 }
```

**Response:** `200 OK` → updated entry object

#### `DELETE /api/entries/:id`
Delete an entry.

**Response:** `200 OK`
```json
{ "message": "Entry deleted successfully" }
```

### Error Responses
All errors return: `{ "message": "..." }`
- `400` — Validation error or duplicate date
- `404` — Entry not found
- `500` — Server error

---

## 16. 🎨 Design System Reference

### Color Tokens (Tailwind)

| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#6366f1` | Primary accent (indigo) |
| `brand-400` | `#818cf8` | Lighter accent, links |
| `brand-600` | `#4f46e5` | Buttons, interactive elements |
| `surface-950` | `#020617` | Page background |
| `surface-900` | `#0f172a` | Card backgrounds, inputs |
| `surface-800` | `#1e293b` | Card borders, secondary bg |
| `surface-700` | `#334155` | Borders, dividers |
| `surface-400` | `#94a3b8` | Muted text |
| `surface-100` | `#f1f5f9` | Primary text |
| `success-400/500` | `#34d399/#10b981` | SAFE status, positive values |
| `danger-400/500` | `#fb7185/#f43f5e` | DANGER status, errors, delete |
| `warning-400/500` | `#fbbf24/#f59e0b` | WARNING status, projected |

### Typography
- **Font:** Inter (loaded from Google Fonts)
- **Numbers:** `tabular-nums` for alignment in tables and stats
- **Sizes:** Tailwind defaults (text-xs through text-2xl)

### Component Classes (index.css)
- `.btn-primary` — indigo gradient button with glow
- `.btn-danger` — red button for destructive actions
- `.btn-ghost` — transparent button with hover
- `.card` — surface-800 card with border, shadow, hover lift
- `.input-field` — surface-900 input with focus ring
- `.input-error` — error state for inputs
- `.label` — small muted label
- `.error-text` — tiny red error message

---

## 17. 🚀 Deployment & Release Workflow

> This section defines the **mandatory end-to-end release process** that every AI agent and developer must follow. Treat this as an internal CI/CD pipeline with human judgment.

---

### 17.1 — 🔁 When to Trigger a Release

A release **MUST** happen when any of the following is true:

| Trigger | Version Bump | Example |
|---|---|---|
| Bug fix completed | **PATCH** (`0.0.X`) | Fix validation edge case |
| New feature added | **MINOR** (`0.X.0`) | Add import functionality |
| Breaking change introduced | **MAJOR** (`X.0.0`) | Change date format, alter data model |

**No code change should be pushed without a corresponding version bump.**

---

### 17.2 — 🔢 Versioning Rules (STRICT)

Follow **Semantic Versioning** with the `-dev` suffix convention:

```
MAJOR.MINOR.PATCH[-PRERELEASE]
```

| Suffix | Meaning | Example |
|---|---|---|
| `-dev` | In-progress AI/developer update, not yet finalized | `v0.0.12-dev` |
| *(none)* | Stable, finalized release | `v0.0.12` |

**Rules:**
- ❌ NEVER skip versions (no jumping from `0.0.11` to `0.0.14`)
- ❌ NEVER reuse a version number
- ✅ ALWAYS increment from the previous version
- ✅ Use `-dev` suffix while changes are still being developed/iterated
- ✅ Remove `-dev` suffix when the change is finalized and verified

---

### 17.3 — 🧠 Pre-Release Checklist (MANDATORY)

Before bumping the version, the AI **MUST** complete this checklist:

#### Impact Analysis
- [ ] **Frontend** — Does the change affect UI rendering, state, or user interactions?
- [ ] **Backend** — Does the change affect API routes, middleware, or database operations?
- [ ] **Data Model** — Does the change alter the Mongoose schema or MongoDB structure?
- [ ] **Validation** — Does the change touch `validation.js` or cumulative constraint logic?
- [ ] **Calculations** — Does the change affect stats, projections, or status thresholds?

#### Regression Checks
- [ ] No regression in CRUD operations (add, edit, delete, clear all)
- [ ] No UI false states (especially fake "success" on failed API calls)
- [ ] Edit history system still records snapshots correctly
- [ ] Export generates valid JSON with complete data

#### Build Verification
- [ ] `cd client && npm run build` completes without errors
- [ ] No console warnings or errors in the build output
- [ ] Production bundle is generated in `client/dist/`

#### Runtime Verification
- [ ] App loads correctly after Render cold start (skeleton → data)
- [ ] API calls succeed within timeout window
- [ ] Month selector, stats card, and table render correctly
- [ ] Toast notifications fire on success/error states

---

### 17.4 — 📝 Required Updates Before Release

The AI **MUST** update **ALL** of the following files — no exceptions:

| # | File | What to Update |
|---|---|---|
| 1 | `package.json` (root) | `"version"` field |
| 2 | `VERSION` | Plain-text version string |
| 3 | `client/src/utils/constants.js` | `APP_VERSION` export |
| 4 | `README.md` | Title line version: `# Render Free Usage Monitor (vX.X.X)` |
| 5 | `CHANGELOG.md` | New dated entry at top with Added/Fixed/Changed sections |
| 6 | `context.md` | Append change summary to Section 11 changelog table and update header version |

> **Note:** `client/package.json` and `server/package.json` have independent version fields. The **root** `package.json` is the canonical project version. Update the sub-packages only if they themselves changed meaningfully (see Tech Debt item #2 and #6 in Section 13).

#### CHANGELOG Entry Format
```markdown
## [X.X.X] - YYYY-MM-DD

### Added
- Feature description

### Fixed
- Bug fix description

### Changed
- Modification description
```

---

### 17.5 — 🔄 Git Workflow

After all updates pass the pre-release checklist:

#### Step 1 — Stage All Changes
```bash
git add .
```

#### Step 2 — Commit with Structured Message
Format:
```
release: vX.X.X - short description
```

Examples:
```
release: v0.0.12-dev - add deployment workflow to context.md
release: v0.0.12 - finalize deployment workflow documentation
release: v0.1.0 - add data import feature
```

**Commit message rules:**
- Always start with `release:` prefix
- Include the version number
- Keep the description concise (under 60 characters)
- Use present tense ("add", "fix", "update" — not "added", "fixed")

#### Step 3 — Push to GitHub
```bash
git push origin main
```

> ⚠️ Only push after **all** pre-release checks pass. A broken push wastes Render build minutes.

---

### 17.6 — ☁️ Deployment (Render)

| Aspect | Detail |
|---|---|
| Trigger | **Automatic** — Render detects `git push` to `main` |
| Build command | Defined in `render.yaml` (client build + server install) |
| Start command | `cd server && npm start` |
| Build time | ~2-4 minutes typical |
| Cold start | 30-90 seconds after 15 min inactivity |

**There is NO manual deployment step.** A push to `main` = a production deploy.

**Pre-push safety checks:**
- ✅ `cd client && npm run build` succeeds locally
- ✅ No TypeScript / ESLint errors blocking build
- ✅ `render.yaml` is unchanged (unless deployment config update is intentional)
- ❌ Do NOT push if build fails — it will consume Render free tier build minutes and deploy broken code

---

### 17.7 — ⚠️ Safety Rules

**NEVER push to `main` if:**
- ❌ Client build (`npm run build`) fails
- ❌ Server fails to start (`npm start` crashes)
- ❌ CRUD operations are broken
- ❌ Validation logic has regressed
- ❌ UI shows incorrect/stale/fake success states
- ❌ Version numbers are out of sync across the 5 required locations

**NEVER modify these files without explicit approval:**
- `render.yaml` — affects deployment infrastructure
- `server/.env` — contains secrets (and is gitignored anyway)
- `.gitignore` — affects what gets tracked/deployed

**Recovery from a bad push:**
1. Fix the issue immediately
2. Bump to the next PATCH version
3. Push the fix — Render will auto-redeploy with the corrected code

---

### 17.8 — 💡 Suggested Next Version

Based on current project state (`v0.0.11-dev`):

| Next Version | When to Use |
|---|---|
| `v0.0.12-dev` | Ongoing AI-assisted improvements, documentation updates |
| `v0.0.12` | Finalized stable release of the above |
| `v0.1.0` | First minor feature release (e.g., data import, auth, PWA) |
| `v1.0.0` | Production-ready release (all `-dev` suffixes removed) |

---

### 17.9 — 🤖 AI Behavior Rule

> **From this point forward, every AI agent interacting with this project MUST behave as an automated release pipeline with judgment.**

**For EVERY code change (fix, feature, or refactor), the AI MUST:**

1. ✅ **Analyze impact** — frontend, backend, data model, validation
2. ✅ **Implement the change** — minimal, safe, following existing patterns
3. ✅ **Run pre-release checklist** — Section 17.3
4. ✅ **Update all version files** — Section 17.4 (all 6 locations)
5. ✅ **Update documentation** — CHANGELOG, README (if needed), context.md
6. ✅ **Stage, commit, and push** — Section 17.5 (only after verification)

**The AI must ensure these four pillars are ALWAYS in sync:**

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────┐
│  Code   │ ←→ │   Docs   │ ←→ │   Version   │ ←→ │  Deployment  │
│ (src)   │    │ (md/log) │    │ (5 files)   │    │ (git+render) │
└─────────┘    └──────────┘    └─────────────┘    └──────────────┘
         ALL FOUR MUST BE IN SYNC AT ALL TIMES
```

**If any pillar is out of sync, the AI must fix it before proceeding with new work.**
