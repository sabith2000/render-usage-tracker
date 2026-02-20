# Render Free Usage Monitor (v0.0.9-dev)

A single-page web app to track monthly cumulative free instance hours on Render.com (750 hrs/month limit).

## Features
- 📊 Track daily usage and monthly cumulative hours
- 📈 Daily increase, average usage, projected total, and remaining hours
- 📅 View past months with auto-detection
- 🕓 Edit history tracking per entry (audit trail, last 20 edits)
- 📥 Export all entries as JSON for backup
- 📉 Sparkline trend chart and month-over-month comparison arrow
- 🎨 Modern dark UI (brand indigo/slate theme, Inter font)
- ✅ Entry validation (no future dates, non-decreasing cumulative hours)
- 📝 Detailed logging (Console: System status only, File: Verbose debug logs)

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup Environment:**
   ```bash
   cp .env.example server/.env
   # Edit server/.env with your MONGODB_URI
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   # Server: http://localhost:5000
   # Client: http://localhost:5173
   ```

## Tech Stack
- **Frontend:** React + Vite + TailwindCSS v3
- **Backend:** Express + Mongoose (MongoDB Atlas)
- **Deployment:** Render (Single Service via `render.yaml`)

## Project Structure
- `client/` — React frontend
- `server/` — Express backend
- `render.yaml` — Deployment blueprint
- `server/logs/` — Backend logs (created at runtime)

## Version History
See [CHANGELOG.md](CHANGELOG.md) for detailed version history.
