# Aura Booking App

A full-stack booking application with React frontend, Node/Express backend, MongoDB Atlas, and Google OAuth.

---

## Bugs Fixed

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `App.js` | Imported `BookingForm` (capital F) — Linux is case-sensitive, component wouldn't load | Corrected to `Bookingform` |
| 2 | `App.jsx` | Orphan file (old version) conflicting with `App.js` | Removed |
| 3 | `main.jsx` | Duplicate entry point alongside `index.js` | Removed |
| 4 | `Bookingform.jsx` | Orphan component not connected to any route | Removed |
| 5 | `POST /api/bookings` | No authentication required — anyone could submit bookings | Added `authenticate` middleware |
| 6 | `CustomerDashboard` | "Book New Service" button linked to `/booking` (non-existent route) | Fixed to redirect to `/` |
| 7 | `Bookingform.js` | No login check — form submitted without auth causing 401 | Added login redirect + token in header |
| 8 | All dashboards | Hardcoded `http://localhost:5000` URLs | Switched to `REACT_APP_API_URL` env var |
| 9 | `App.js` | No route guards — `/admin` and `/customer` were publicly accessible | Added `PrivateRoute` component |
| 10 | `App.jsx` | Referenced non-existent `/api/notifications` endpoint | Removed (with orphan file) |

**Added:** Google OAuth via Google Identity Services (one-tap / button sign-in)

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
# Edit .env and set GOOGLE_CLIENT_ID (see Google OAuth section below)
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
# Edit .env and set REACT_APP_GOOGLE_CLIENT_ID
npm start
```

App runs at **http://localhost:3000**

---

## Google OAuth Setup (required for "Sign in with Google")

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add to **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://your-live-domain.com` (production)
7. Click **Create** — copy the **Client ID**
8. Paste the Client ID in both `.env` files:
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`
   - `frontend/.env` → `REACT_APP_GOOGLE_CLIENT_ID=...`

---

## Live Deployment (Free)

### Option A: Render.com (Recommended — free tier)

**Backend:**
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables (copy from `backend/.env`)
7. Set `FRONTEND_URL` to your Render frontend URL

**Frontend:**
1. New → Static Site
2. Root Directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `build`
5. Add env vars: `REACT_APP_API_URL=https://your-backend.onrender.com`
6. Add `REACT_APP_GOOGLE_CLIENT_ID=your-client-id`

### Option B: Railway.app

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add two services: one for `backend/`, one for `frontend/`
4. Set env vars in Railway dashboard
5. Railway auto-assigns live URLs

### Option C: Vercel (Frontend) + Render (Backend)

Frontend → https://vercel.com (drag & drop `frontend/` folder)
Backend → https://render.com (as above)

---

## Environment Variables Reference

**backend/.env**
```
PORT=5000
JWT_SECRET=your_strong_secret_here
DATABASE_URL=your_mongodb_atlas_url
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Default Admin Account

Create one via signup with role `admin`, or directly insert into MongoDB/users.json:
```json
{ "email": "admin@yourdomain.com", "role": "admin" }
```
