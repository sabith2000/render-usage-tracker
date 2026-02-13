# Render Free Usage Monitor (v0.0.5-dev)

Building a single-page web app to track monthly cumulative free instance hours on Render.com (750 hrs/month limit).

## Features
- 📊 Track daily usage and monthly cumulative hours
- 📈 See daily increase, average usage, and projected total
- 📅 View past months with auto-detection
- 🎨 Modern UI with Dark Mode (brand indigo/slate theme)
- ✅ Entry validation (no future dates, non-decreasing cumulative hours)
- 📝 Detailed logging (Console: System status only, File: Verbose debug logs)

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ../server && npm install
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
- `client/` - React frontend
- `server/` - Express backend
- `render.yaml` - Deployment blueprint
- `server/logs/` - Backend logs (created on runtime)

## Version History
See [CHANGELOG.md](CHANGELOG.md) for detailed version history.
