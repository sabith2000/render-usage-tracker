# Render Free Usage Monitor — Roadmap

> **Last Updated:** 2026-03-31
> **Current Version:** 0.0.14-dev
> **Maintained by:** AI + Human collaboration

This file tracks planned, in-progress, and tentative work. Any AI agent or developer should check this file before starting new work to avoid conflicts and understand priorities.

---

## ✅ Completed Phases

### Phase 1 — `v0.0.13-dev` — Stability + Consistency
- [x] Rename `LoadingSpinner.jsx` → `SkeletonLoader.jsx`
- [x] Replace hardcoded `750` with `FREE_HOUR_LIMIT` constant
- [x] Add healthcheck endpoint (`GET /api/health`)
- [x] Add "Last synced" timestamp in Footer
- [x] Version consolidation (root + client + server package.json synced)

### Phase 2 — `v0.0.14-dev` — Network + UX Reliability
- [x] Axios timeout: 10s → 30s with retry logic (2x exponential backoff)
- [x] Date picker z-index overlap fix
- [x] History modal "from → to" logic rewrite

---

## 🔜 Phase 3 — `v0.1.0-dev` — Data Management + Smart Features

> **Status:** APPROVED — Ready to execute
> **Version bump:** MINOR (new features)
> **Estimated changes:** ~15 files, schema migration (additive)

### Execution Order

```
3.1 Entry Notes → 3.2 Time-Normalized Calc → 3.3 Bulk Delete → 3.4 JSON Import
```

---

### 3.1 — Entry Notes

> Users need to annotate why a particular day had unusual usage (e.g., "Deployed new build", "Server ran extra due to testing").

**What changes:**

| File | Change |
|---|---|
| `server/models/Entry.js` | Add `notes: { type: String, default: '', maxlength: 200 }` |
| `server/routes/entries.js` | Accept `notes` in POST/PUT, include in history snapshots |
| `client/src/components/AddEntryForm.jsx` | Add textarea input (200 char limit, optional) |
| `client/src/components/EntriesTable.jsx` | Show 💬 icon on rows with notes, tooltip on hover |
| `client/src/hooks/useEntries.js` | Include `notes` in export data |

**Risk:** 🟢 Low — Additive schema change, Mongoose defaults handle existing data.

---

### 3.2 — Time-Normalized Daily Increase

> When recording times differ (10 AM vs 9 PM next day = 35 hrs, not 24), the daily increase and projections are skewed.

**The problem:**
```
Day 1 @ 10:00 AM → 100 hrs
Day 2 @ 9:00 PM  → 130 hrs
Shown: +30.00/day  ← WRONG (35 real hours passed)
Actual: ~20.57/day  ← CORRECT (normalized to 24h)
```

**What changes:**

| File | Change |
|---|---|
| `server/models/Entry.js` | Add `recordedAt: { type: String, default: '', match: /^$\|^\d{2}:\d{2}$/ }` |
| `server/routes/entries.js` | Accept `recordedAt` in POST/PUT |
| `client/src/components/AddEntryForm.jsx` | Add `<input type="time">` (auto-filled with current IST time, optional) |
| `client/src/utils/dateHelpers.js` | Add `parseDateTime(dateStr, timeStr)` helper |
| `client/src/utils/calculations.js` | Normalize `computeDailyIncrease()` and `computeMonthlyStats()` when time data available |
| `client/src/components/EntriesTable.jsx` | Show recording time next to date |

**Behavior:**
- When both entries have `recordedAt` → show **normalized** daily increase (24h equivalent)
- When either is missing → **fall back** to current calendar-day calculation
- Auto-fill current IST time for new entries (user can clear/change)

**Risk:** 🟡 Medium — Touches calculation logic, but fully backward-compatible (no time = current behavior).

---

### 3.3 — Bulk Delete Endpoint

> Current `clearAll` fires N individual DELETE requests. Replace with single atomic operation.

**What changes:**

| File | Change |
|---|---|
| `server/routes/entries.js` | Add `DELETE /api/entries` route (uses `Entry.deleteMany({})`) |
| `client/src/services/api.js` | Add `deleteAllEntries()` function |
| `client/src/hooks/useEntries.js` | Replace loop in `clearAll` with single API call |

**Risk:** 🟢 Low — Confirmation dialog already exists. Single DB call is safer than N parallel calls.

---

### 3.4 — JSON Import (Skip-Duplicates)

> Complement the existing export with the ability to restore from a JSON file.

**What changes:**

| File | Change |
|---|---|
| `server/routes/entries.js` | Add `POST /api/entries/import` route (skip existing dates) |
| `client/src/services/api.js` | Add `importEntries()` function |
| `client/src/App.jsx` | Add "Import" button next to "Export", with hidden file input |

**Import behavior:**
- Accepts JSON with `entries[]` array
- Skips entries whose `date` already exists in DB (never overwrites)
- Returns `{ imported: N, skipped: M }`
- Handles `notes` and `recordedAt` fields if present

**Risk:** 🟡 Medium — Data integrity concern, mitigated by skip-duplicates mode.

---

### Phase 3 — Open Decisions

> These must be answered before execution starts.

| # | Question | Recommendation |
|---|---|---|
| 1 | Auto-fill recording time with current IST? | ✅ Yes |
| 2 | Capture notes in edit history snapshots? | ✅ Yes |
| 3 | Show normalized or raw daily increase? | Show normalized only (clean) |
| 4 | Notes display: tooltip vs expandable row? | Tooltip (compact) |

---

## 📋 Phase 4 — `v0.1.1-dev` — Polish + Quality of Life (TENTATIVE)

> **Status:** Planned, not approved
> **Priority:** Medium
> **Depends on:** Phase 3 completion

### 4.1 — Keyboard Navigation for MonthSelector
- Currently mouse-only custom dropdown
- Add `ArrowUp/ArrowDown` to navigate, `Enter` to select, `Escape` to close
- Follow WAI-ARIA combobox pattern

### 4.2 — Improved Export Format
- Add CSV export option alongside JSON
- Include computed fields (daily increase, normalized rate) in export
- Add export date range filter (export specific months)

### 4.3 — Mobile Responsiveness Audit
- Test all components at 320px–480px widths
- Fix any overflow/truncation issues in table columns
- Make date picker and time input touch-friendly
- Ensure MonthSelector works well on mobile

### 4.4 — Error Boundary Component
- Wrap the entire app in a React Error Boundary
- Show a friendly crash screen with "Reload" button instead of blank page
- Log error details for debugging

### 4.5 — `SkeletonLoader` Improvements
- Match skeleton to actual page layout more precisely (now that notes + time fields exist)
- Add skeleton for the Footer "last synced" indicator

---

## 🔮 Phase 5 — `v0.2.0-dev` — Analytics + Visualization (TENTATIVE)

> **Status:** Idea stage, not planned
> **Priority:** Low-Medium
> **Version bump:** MINOR

### 5.1 — Monthly Comparison Chart
- Side-by-side bar chart comparing usage across months
- Show which months were SAFE/WARNING/DANGER
- Library: lightweight (e.g., recharts or hand-rolled SVG)

### 5.2 — Usage Heatmap
- Calendar heatmap showing daily increase intensity
- Green (low usage) → Red (high usage)
- Similar to GitHub contribution graph

### 5.3 — Weekly Summary View
- Group entries by week (Mon-Sun)
- Show weekly average, weekly total increase
- Identify which weeks had highest/lowest usage

### 5.4 — Trend Prediction Improvement
- Current: simple linear projection (`avgPerDay × daysInMonth`)
- Improved: weighted moving average (recent days matter more)
- Show confidence band (best/worst case projections)

---

## ⚡ Phase 6 — `v0.3.0-dev` — Platform Features (TENTATIVE)

> **Status:** Idea stage, not planned
> **Priority:** Low
> **Version bump:** MINOR

### 6.1 — Dark/Light Theme Toggle
- `ThemeContext` is already pre-wired
- Implement light mode color tokens
- Add toggle button in Header
- Persist preference in `localStorage`

### 6.2 — PWA / Offline Caching
- Add service worker for asset caching
- Cache the last successful API response for offline viewing
- Show "offline" indicator when server is unreachable
- Sync when connection restored

### 6.3 — Multi-Service Tracking
- Track multiple Render services (not just one)
- Each service has its own 750-hour budget
- Add service name/label to entries
- Dashboard showing all services

### 6.4 — Notification Alerts
- Browser notification when projected usage exceeds threshold
- Optional email alerts (would require auth + email service)
- Configurable thresholds (e.g., warn at 80%, alert at 90%)

### 6.5 — Auto-Fetch from Render API
- Integrate with Render's REST API to automatically pull usage data
- Requires Render API key (stored securely)
- Scheduled fetch (daily cron job)
- Would make manual entry optional

---

## 🧪 Testing Backlog (ONGOING)

> These are always relevant and can be picked up at any time.

- [ ] Add unit tests for `validation.js` (month-scoped constraint edge cases)
- [ ] Add unit tests for `calculations.js` (daily increase, projections, time normalization)
- [ ] Add unit tests for `dateHelpers.js` (IST conversions, parsing, formatting)
- [ ] Add API integration tests for CRUD routes
- [ ] Add E2E test for the full add → edit → delete → export flow

---

## 🏷️ Version Roadmap Summary

| Version | Theme | Status |
|---|---|---|
| `v0.0.13-dev` | Stability + Consistency | ✅ Released |
| `v0.0.14-dev` | Network + UX Reliability | ✅ Released |
| `v0.1.0-dev` | Data Management + Smart Features | 🔜 Approved |
| `v0.1.1-dev` | Polish + Quality of Life | 📋 Tentative |
| `v0.2.0-dev` | Analytics + Visualization | 🔮 Idea stage |
| `v0.3.0-dev` | Platform Features | 🔮 Idea stage |
| `v1.0.0` | Production-Ready Stable Release | 🎯 Goal |

---

## 📌 Rules for This File

1. **Update this file** whenever a phase is started, completed, or new ideas emerge
2. **Move completed phases** to the "Completed" section at the top
3. **Never delete tentative items** — mark as "Skipped (reason)" instead
4. **AI agents must read this** before starting any new feature work
5. **Keep in sync** with `CHANGELOG.md` and `context.md`
