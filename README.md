# Render Free Usage Monitor

Track monthly cumulative free instance hours on Render.com (750 hours/month limit).

## Tech Stack

- **Frontend:** React (Vite) + TailwindCSS v3
- **Backend:** Express.js + MongoDB Atlas (Mongoose)
- **Dev Tooling:** concurrently, react-hot-toast

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

## Setup

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd usage-monitoring
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Create environment file:
   ```bash
   cp .env.example server/.env
   ```
   Update `MONGODB_URI` with your MongoDB Atlas connection string.

4. Start development:
   ```bash
   npm run dev
   ```
   - Client runs on `http://localhost:5173`
   - Server runs on `http://localhost:5000`

## Production Build

```bash
npm run build
npm start
```

The Express server serves the built React app from `client/dist/`.

## Project Structure

```
usage-monitoring/
├── client/          # React frontend (Vite + TailwindCSS)
│   └── src/
│       ├── components/   # UI components
│       ├── context/      # Theme context
│       ├── hooks/        # Custom hooks
│       ├── services/     # API service layer
│       └── utils/        # Calculation, validation, date helpers
├── server/          # Express backend
│   ├── models/      # Mongoose models
│   └── routes/      # API routes
├── VERSION          # Current version
└── CHANGELOG.md     # Release history
```

## Version

See [VERSION](./VERSION) for current version. See [CHANGELOG](./CHANGELOG.md) for release history.

## Made By

Built with ❤️ for tracking Render.com free tier usage.

---

© 2026 Render Free Usage Monitor. All rights reserved.
