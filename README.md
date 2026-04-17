# Banana Game

Banana Game is a full-stack web application built with Django for the backend API and React + Vite for the frontend client.

## Project Structure

```text
apps/
  django_backend/    Django project, REST API, SQLite database
  frontend/          React client built with Vite
```

## Requirements

- Python 3.10 or later
- Node.js 18 or later
- npm

## Setup

Install frontend dependencies from the repository root:

```powershell
npm install
```

Set up the backend environment:

```powershell
cd apps/django_backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

## Running the Application

Use two terminals.

Backend terminal:

```powershell
cd apps/django_backend
python manage.py runserver
```

Frontend terminal:

```powershell
npm.cmd run dev -w apps/frontend
```

## How to Use the Backend

The backend is a Django REST API. It provides authentication, profile management, game progress, rewards, and password reset features.

Backend URL:

```text
http://127.0.0.1:8000/
```

Use the backend server when testing API requests, database changes, or admin workflows.

## How to Use the Frontend

The frontend is a React application that provides the user interface for login, registration, gameplay, profile screens, and leaderboard views.

Frontend URL:

```text
http://localhost:5173/
```

Start the backend first, then open the frontend in a browser and interact with the app through the UI.

## API Reference

All backend routes are prefixed with `/api/`.

### Authentication

- `POST /api/auth/register/` - create a new account
- `POST /api/auth/login/` - sign in with username and password
- `POST /api/auth/google/` - sign in with Google
- `POST /api/auth/refresh/` - refresh JWT access tokens
- `POST /api/auth/password/` - change the current password
- `POST /api/auth/password/forgot/` - request a password reset email
- `POST /api/auth/password/reset/` - confirm a password reset with token

### User

- `GET /api/user/stats/` - get user progress and stats
- `PUT /api/user/update/` - update profile details

### Game

- `GET /api/game/puzzle/` - get puzzle or level data
- `POST /api/game/collect/` - collect rewards after gameplay
- `POST /api/game/save-banana/` - save banana progress or score

### Leaderboard

- `GET /api/leaderboard/` - fetch leaderboard rankings

## Helpful Commands

From the repository root:

```powershell
npm run install-all
npm run dev
```

Notes:
- `npm run dev` starts the frontend workspace script.
- The backend is started separately with Django's `runserver` command.

## Troubleshooting

If PowerShell blocks npm scripts, use `npm.cmd` instead:

```powershell
npm.cmd run dev -w apps/frontend
```

## Development Notes

- SQLite database file: `apps/django_backend/db.sqlite3`
- Password reset API notes: `apps/django_backend/game/PASSWORD_RESET_API.md`
- This setup is intended for development only.