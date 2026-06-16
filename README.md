# Finance Tracker

A premium, modern Finance Tracker application built with **FastAPI** (Python) on the backend and **React** (Vite + TypeScript) on the frontend. The application features rich aesthetics including **Glassmorphism**, smooth transitions, page skeletons, and multi-profile wallet capabilities .

---

## Features

- **Dynamic Visual Dashboard**: Real-time savings rates, monthly income vs. expense graphs, top spending categories, and daily trends.
- **Three Core Themes**: Cycle through **Light Mode**, **Dark Mode**, and **Glass Mode** (complete with a moving mesh gradient background and blur effects).
- **Multi-Profile support**: Create different profile wallets and track balances separately.
- **Transactions & Transfers**: Record debit/credit transactions with search/filter features, and move money between profile wallets smoothly.
- **Indian Rupee Formatting**: Displays all numbers using the standard Indian grouping system (lakhs/crores) and `₹` symbols.
- **Modern Loaders**: Page skeleton shimmers and high-fidelity page-entry transition animations.

---

## Project Structure

```
├── backend/            # FastAPI Python server
│   ├── app/            # Source code (api, models, schemas, services, etc.)
│   ├── alembic/        # Database migration files
│   └── .env.example    # Template for backend configuration
└── frontend/           # React TypeScript app
    ├── src/            # Pages, hooks, layouts, state stores, etc.
    └── .env.example    # Template for frontend configuration
```

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.12+**
- **Node.js 20+**
- **Docker Desktop** (used to spin up the PostgreSQL database)

---

## Quick Start Guide

### 1. Backend Setup

Open a terminal and navigate to the `backend` folder:
```bash
cd backend

# Create virtual environment
python -m venv .venv
# Activate virtual environment
.venv\Scripts\activate      # Windows (PowerShell/CMD)
# source .venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# Start PostgreSQL Database (Docker container)
docker compose up -d

# Run database migrations to create tables
alembic upgrade head

# Start the server
uvicorn app.main:app --host 0.0.0.0 --reload
```
The backend server runs locally at **`http://localhost:8000`** (and binds to `0.0.0.0` to be accessible from your local network).

---

### 2. Frontend Setup

Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend

# Install Node modules
npm install

# Create .env file from template (optional, works dynamically if omitted)
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# Run the dev server
npx vite --host 0.0.0.0
```
The frontend dev server runs locally at **`http://localhost:5173`** (or `5174` if port `5173` is occupied) and is accessible on your local network.

---

## Authentication Configuration

By default, the application is set to **Dev Login** mode. When logging in, simply type any email/name and click **Sign In (Dev)**. No password is required.

### Google Sign-In (Optional)
To set up Google Authentication:
1. Generate a client ID from the Google Developer Console.
2. Fill in the variables in your `.env` files:
   * In `backend/.env`: `GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com`
   * In `frontend/.env`: `VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com`
3. Restart both servers.
