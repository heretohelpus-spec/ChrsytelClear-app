# Chrystel Clear — Her, Becoming

Public website + private operations dashboard. One app, one deploy.

## Structure

```
chrystelclear-app/
├── server.js          ← Main backend (Express)
├── package.json       ← Dependencies
├── .env               ← Credentials (DO NOT commit)
├── .env.example       ← Reference for env vars
├── .gitignore
├── public/
│   └── index.html     ← Public website (chrystelclear.co)
└── dashboard/
    ├── dashboard.html  ← Overview (protected)
    ├── content.html    ← Content calendar
    ├── funnel.html     ← Pipeline + script generator
    ├── performance.html← Analytics
    ├── clients.html    ← Coaching tracker
    └── research.html   ← Research + competitors
```

## URLs

- `chrystelclear.co` → Public website (no login)
- `chrystelclear.co/dashboard` → Dashboard (login required)
- `chrystelclear.co/login` → Login page
- `chrystelclear.co/logout` → Sign out

## Default Login

- Username: `crystel`
- Password: `herbecoming2026`

Change these in Railway environment variables.

## Setup

1. Copy dashboard files from `~/her-becoming/` into `dashboard/`
2. `npm install`
3. `npm start`
4. Open `http://localhost:3000`

## Deploy to Railway

1. Push to GitHub
2. Connect repo in Railway
3. Set environment variables in Railway:
   - `DASH_USER` = crystel
   - `DASH_PASS` = (choose a strong password)
   - `SESSION_SECRET` = (random string)
4. Deploy
5. Point chrystelclear.co to Railway URL
