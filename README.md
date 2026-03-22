# Teleka Taxi Service

A full-stack taxi service application with authentication for customers, admins, and drivers.

## Features

- **Customer Login**: Google OAuth integration
- **Admin Login**: Email/password authentication
- **Driver Registration**: Application system with admin approval
- **Persistent Storage**: SQLite database for all user data
- **Cross-device Sessions**: Login state remembered across devices

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   - Add your Google OAuth client secret for `GOOGLE_CLIENT_SECRET`
   - Database path is configured to use AppData

3. Start the server:
   ```bash
   npm start
   ```

4. Open browser to `http://localhost:3000`

## Authentication

### Customer (index.html)
- Click "Login" in navbar
- Authenticate with Google
- Data stored in `users` table

### Admin (admin.html)
- Email: admin@telekataxi.com
- Password: TelekaAdmin!2026
- Access admin dashboard for driver approvals

### Driver (driver.html)
- Register with form (requires admin approval)
- Login with approved account
- JWT tokens for session management

## Database

SQLite database with tables:
- `users`: Customer accounts (Google OAuth)
- `drivers`: Driver accounts and applications
- `sessions`: Persistent sessions

## Security

- Bcrypt password hashing
- JWT tokens for drivers
- Session-based auth for customers/admins
- CORS configured for allowed origins

## Notes

- Google login requires valid client secret
- Driver registrations need admin approval
- All data persists in SQLite database
- Sessions work across devices</content>
<parameter name="filePath">c:\Users\ISAAC E\Desktop\nav  bar\README.md