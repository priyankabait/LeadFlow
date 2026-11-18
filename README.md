# LeadFlow CRM

A premium, Salesforce-integrated CRM web application for managing leads, accounts, contacts and opportunities.

> **Status:** Working application. Connect your Salesforce org to view live CRM data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, Framer Motion, Recharts, React Router v6, Axios |
| **Backend** | Node.js, Express.js, Express Session |
| **CRM Integration** | Salesforce REST API v59, OAuth 2.0 + PKCE, SOQL |
| **Dev tooling** | Nodemon, ESLint |

**Data source:** Salesforce is the single source of truth for all CRM records.  
No local database is used for CRM data.

---

## Prerequisites

- Node.js 20+
- A Salesforce Developer Account (free at [developer.salesforce.com](https://developer.salesforce.com))
- A Salesforce **External Client App** (Connected App) with OAuth scopes: `api`, `refresh_token`

---

## Salesforce Setup

1. Log in to your Salesforce Developer account
2. Go to **Setup → App Manager → New External Client App**
3. Enable OAuth and add scopes: `api`, `refresh_token`, `offline_access`
4. Set the **Callback URL** to:
   ```
   http://localhost:5000/api/auth/salesforce/callback
   ```
5. Note your **Consumer Key** (Client ID) and **Consumer Secret**

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/priyankabait/LeadFlow.git
cd LeadFlow
git checkout fix/production-readiness
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_long_random_secret_here

SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_CALLBACK_URL=http://localhost:5000/api/auth/salesforce/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com

FRONTEND_URL=http://localhost:5173
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |

---

## Connecting Salesforce

1. Open the application at http://localhost:5173
2. Navigate to **Salesforce Integration** in the sidebar
3. Click **Connect Salesforce**
4. Complete the Salesforce OAuth login
5. You are redirected back — CRM data loads automatically

---

## OAuth Flow

```
Browser → GET /api/auth/salesforce
        ← 302 Redirect to Salesforce login
Salesforce → GET /api/auth/salesforce/callback?code=...&state=...
Backend validates state, exchanges code for tokens (PKCE)
Tokens stored server-side only (never sent to browser)
        ← 302 Redirect to /salesforce-integration?connected=true
```

---

## API Endpoints

### Authentication
| Method | Path | Description |
|---|---|---|
| GET  | `/api/auth/salesforce`          | Start OAuth flow |
| GET  | `/api/auth/salesforce/callback` | OAuth callback handler |
| GET  | `/api/auth/status`              | Connection status + user info |
| POST | `/api/auth/disconnect`          | Clear tokens |

### CRM Resources
| Method | Path | Description |
|---|---|---|
| GET    | `/api/dashboard/stats`     | Aggregate dashboard statistics |
| GET    | `/api/leads`               | List leads (search, status, limit, offset) |
| GET    | `/api/leads/:id`           | Get lead by ID |
| POST   | `/api/leads`               | Create lead |
| PATCH  | `/api/leads/:id`           | Update lead |
| DELETE | `/api/leads/:id`           | Delete lead |
| GET    | `/api/accounts`            | List accounts |
| GET    | `/api/accounts/:id`        | Get account |
| POST   | `/api/accounts`            | Create account |
| PATCH  | `/api/accounts/:id`        | Update account |
| DELETE | `/api/accounts/:id`        | Delete account |
| GET    | `/api/contacts`            | List contacts |
| GET    | `/api/contacts/:id`        | Get contact |
| POST   | `/api/contacts`            | Create contact |
| PATCH  | `/api/contacts/:id`        | Update contact |
| DELETE | `/api/contacts/:id`        | Delete contact |
| GET    | `/api/opportunities`       | List opportunities |
| GET    | `/api/opportunities/:id`   | Get opportunity |
| POST   | `/api/opportunities`       | Create opportunity |
| PATCH  | `/api/opportunities/:id`   | Update opportunity |
| DELETE | `/api/opportunities/:id`   | Delete opportunity |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `SESSION_SECRET` | Yes | Long random string for session signing |
| `SALESFORCE_CLIENT_ID` | Yes | Salesforce Consumer Key |
| `SALESFORCE_CLIENT_SECRET` | Yes | Salesforce Consumer Secret |
| `SALESFORCE_CALLBACK_URL` | Yes | Must match Salesforce app settings |
| `SALESFORCE_LOGIN_URL` | No | Default: `https://login.salesforce.com` |
| `FRONTEND_URL` | No | Frontend origin for CORS (default: `http://localhost:5173`) |

### Frontend (optional `frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL. Leave empty in dev (Vite proxy handles it). |

---

## Security Notes

- Salesforce tokens are stored **server-side only** in an in-memory Map. They are never sent to the browser.
- OAuth uses **PKCE** (Proof Key for Code Exchange) for security.
- Cookies are `httpOnly` and `SameSite=lax`. In production, set `NODE_ENV=production` to enable `Secure` cookies.
- Never commit your `.env` file. It is listed in `.gitignore`.
- CORS is restricted to the `FRONTEND_URL` origin only.

---

## Project Structure

```
LeadFlow/
├── backend/
│   ├── config/
│   │   └── salesforce.js       Salesforce env config
│   ├── controllers/            Route handlers
│   ├── middleware/
│   │   ├── authMiddleware.js   SF token check
│   │   └── errorHandler.js     Global error handler
│   ├── routes/                 Express routers
│   ├── services/
│   │   ├── salesforceService.js  Token store + API client
│   │   ├── leadService.js
│   │   ├── accountService.js
│   │   ├── contactService.js
│   │   └── opportunityService.js
│   ├── utils/
│   │   ├── apiResponse.js      { success, error } helpers
│   │   └── logger.js           Timestamped console logger
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/         Sidebar, TopNav, MainLayout
        │   ├── ui/             StatCard, LoadingSkeleton, Badge…
        │   └── charts/         PipelineChart, LeadStatusChart…
        ├── hooks/              useSalesforce, useLeads, etc.
        ├── pages/              Dashboard, Leads, Accounts…
        └── services/           api.js, authService.js, etc.
```
