# 🎓 Placement AI Trainer — Full Stack

AI-powered soft skills trainer for placement preparation.  
**Stack**: Node.js + Express + SQLite (backend) · Vanilla HTML/CSS/JS (frontend) · Claude API

---

## 📁 Project Structure

```
placement-trainer/
├── backend/
│   ├── server.js           # Express app entry
│   ├── db.js               # SQLite schema & init
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── routes/
│   │   ├── auth.js         # /api/auth/*
│   │   ├── sessions.js     # /api/sessions/*
│   │   └── analytics.js    # /api/analytics/*
│   ├── .env.example        # Copy to .env
│   └── package.json
└── frontend/
    └── index.html          # Single-file frontend
```

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=4000
JWT_SECRET=your_secret_key_here_change_this
CLIENT_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
```

Start the server:
```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

Server runs at → `http://localhost:4000`

### 2. Frontend

Just open `frontend/index.html` in your browser.  
Or serve with any static file server:

```bash
cd frontend
npx serve .
# or
python3 -m http.server 3000
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Register / Login with JWT tokens (7-day expiry) |
| 💬 Practice | 5 modes: GD, Debate, Interview, Communication, Situational |
| 💾 Save Sessions | Every chat auto-saved to SQLite with messages |
| 📊 Analytics | Sessions by mode, score trends, averages dashboard |
| 📜 History | Browse, reload, or delete past sessions |
| 🤖 Claude AI | Real-time responses via Anthropic API |

---

## 🔌 API Reference

### Auth
```
POST /api/auth/register   { name, email, password }
POST /api/auth/login      { email, password }
GET  /api/auth/me         (Bearer token)
```

### Sessions
```
POST   /api/sessions              Start new session
GET    /api/sessions              List all sessions
GET    /api/sessions/:id          Get session + messages
POST   /api/sessions/:id/messages Save message
PATCH  /api/sessions/:id/end      End session
DELETE /api/sessions/:id          Delete session
```

### Analytics
```
GET /api/analytics/dashboard     Full stats for logged-in user
```

---

## 🗄️ Database

SQLite file auto-created at `backend/data/placement.db` on first run.

**Tables**: `users` · `sessions` · `messages` · `scores`

---

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Add rate limiting for production (`express-rate-limit`)
- Consider HTTPS + helmet.js for production deployment
