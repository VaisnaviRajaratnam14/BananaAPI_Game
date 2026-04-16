# Forgot Password with Email Reset (Django + React)

## Tech Stack Used
- Backend: Django + Django REST Framework + SQLite
- Frontend: React (Vite)
- Password hashing: Argon2 (configured in settings)

## Endpoints
- `POST /api/forgot-password/` (alias: `POST /api/auth/password/forgot/`)
- `POST /api/reset-password/` (alias: `POST /api/auth/password/reset/`)

## Database Schema Example
Model: `PasswordResetToken`
- `id` (PK)
- `user` (FK to `auth.User`)
- `token_hash` (sha256 hash of random token, unique, indexed)
- `expires_at` (datetime, indexed)
- `used_at` (datetime nullable)
- `created_at` (datetime)

## Request/Response Examples

### 1) Forgot Password
Request:
```http
POST /api/forgot-password/
Content-Type: application/json

{
  "email": "player@example.com"
}
```

Success response (same for existing/non-existing emails to prevent enumeration):
```json
{
  "message": "If the email is registered, a password reset link will be sent"
}
```

### 2) Reset Password
Request:
```http
POST /api/reset-password/
Content-Type: application/json

{
  "token": "RAW_TOKEN_FROM_EMAIL_LINK",
  "newPassword": "NewStrongPassword123"
}
```

Success response:
```json
{
  "message": "Password reset successfully"
}
```

Error response example:
```json
{
  "error": "Invalid or expired reset link"
}
```

## Email Template Example
Subject: `Banana Game Password Reset`

Body:
```text
Hi,

We received a request to reset your Banana Game password.
Click this secure link (valid for 15 minutes):
https://mygame.com/reset-password?token=RAW_TOKEN

If you did not request this reset, you can safely ignore this email.
This link can be used only once.
```

## Email Delivery Setup
- The project is configured for Gmail SMTP when `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`.
- Password reset delivery requires a valid Gmail App Password, not the normal account password.
- If SMTP is not configured correctly, Django will raise an authentication error and the reset mail will not be delivered.

## Security Notes Implemented
- Random token generated with `secrets.token_urlsafe(32)`
- Token stored as SHA-256 hash in DB (not plain token)
- 15-minute expiration window
- Single-use token (`used_at` set after successful reset)
- Other active tokens invalidated once password is reset
- Non-enumerating forgot-password response
- Reset links use the configured `FRONTEND_URL`
- Rate limiting:
  - Forgot endpoint: 5 attempts / 15 min per IP+email
  - Reset endpoint: 10 attempts / 15 min per IP
