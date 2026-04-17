# Banana Game

Banana Game is a full-stack web game built with:
- Django + Django REST Framework for backend APIs
- React + Vite for the frontend client

## Repository Layout

```text
apps/
	django_backend/
	frontend/
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Quick Start

### 1. Frontend Dependencies

From the repository root:

```powershell
npm install
```

### 2. Backend Setup

From the repository root:

```powershell
cd apps/django_backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

### 3. Run the Application

Use two terminals.

Terminal 1 (backend):

```powershell
cd apps/django_backend
python manage.py runserver
```

Terminal 2 (frontend):

```powershell
npm.cmd run dev -w apps/frontend
```

## Local URLs

- Frontend: http://localhost:5173/
- Backend: http://127.0.0.1:8000/

## Available Root Scripts

From the repository root:

```powershell
npm run install-all
npm run dev
```

Notes:
- `npm run dev` runs only the frontend workspace script.
- Backend is started separately with Django's `runserver` command.

## Troubleshooting (Windows PowerShell)

If you see script execution policy errors for `npm`, use `npm.cmd` instead:

```powershell
npm.cmd run dev -w apps/frontend
```

## Development Notes

- SQLite database file: `apps/django_backend/db.sqlite3`
- Backend API-specific notes: `apps/django_backend/game/PASSWORD_RESET_API.md`
- This setup is intended for development environments.