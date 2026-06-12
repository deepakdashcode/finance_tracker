# Finance Tracker — Setup Guide

## Moving to Another PC

1. Zip the entire `Finance Tracker` folder (including `backend/`, `frontend/`, `idea.md`)
2. Copy the zip to the new PC and extract it

---

## Prerequisites

Install these on the new PC:

- **Python 3.12+** — https://python.org
- **Node.js 20+** — https://nodejs.org
- **Docker Desktop** — https://docker.com (for PostgreSQL)

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate     # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (Docker)
docker compose up -d

# Run database migrations
alembic upgrade head

# Start the backend
uvicorn app.main:app --host 0.0.0.0 --reload
```

Backend runs at **http://localhost:8000**

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Configuration

### Google Sign-In (optional)

To enable Google login, set the same Client ID in both files:

**`backend/.env`**
```
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

**`frontend/.env`**
```
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

If both are left **empty**, the app uses **Dev Login** mode — just enter an email on the login page.

### Environment Files

These are included in the zip and work out of the box for local dev:

| File | Purpose |
|------|---------|
| `backend/.env` | Database URL, JWT secret, Google Client ID |
| `frontend/.env` | API URL, Google Client ID |

For production, change `JWT_SECRET`, `DATABASE_URL`, and `FRONTEND_URL`.

---

## Quick Start (no Google login)

```bash
# Terminal 1
cd backend
.venv\Scripts\activate
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload

# Terminal 2
cd frontend
npm run dev
```

Open **http://localhost:5173** → click **Sign In (Dev)** with the default email.

---

## Project Structure

```
backend/          — FastAPI (Python)
  app/
    api/          — Route handlers
    models/       — SQLAlchemy models
    schemas/      — Pydantic validation
    services/     — Business logic
    repositories/ — Data access
    core/         — Config, DB, JWT, auth
  alembic/        — Database migrations

frontend/         — React + Vite + TypeScript
  src/
    pages/        — Page components
    hooks/        — TanStack Query hooks
    components/   — UI components (shadcn)
    layouts/      — Sidebar/mobile layouts
    store/        — Zustand (auth, theme)
    services/     — Axios API client
    routes/       — React Router config
```
