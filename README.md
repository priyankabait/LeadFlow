# LeadFlow CRM

A premium, enterprise-grade Salesforce-integrated CRM web application.

## Tech Stack
- **Frontend**: React.js + Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js
- **Integration**: Salesforce REST API + OAuth 2.0
- **Database**: MongoDB (preferences only; Salesforce is CRM data source)
- **DevOps**: Docker, Docker Compose, Jenkins

## Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Salesforce Developer Account with External Client App

## Salesforce Setup
1. Log in to your Salesforce Developer account
2. Go to Setup > App Manager > Your External Client App (LeadFlow Integration)
3. Note your Consumer Key and Consumer Secret
4. Set Callback URL to: `http://localhost:5000/api/auth/callback`
5. Enable OAuth Scopes: api, refresh_token, offline_access

## Local Development Setup

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your Salesforce credentials
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173  
Backend runs at: http://localhost:5000

## Environment Variables (backend/.env)
See backend/.env.example for all required variables.

Required Salesforce variables:
- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_CALLBACK_URL=http://localhost:5000/api/auth/callback`
- `SALESFORCE_LOGIN_URL=https://login.salesforce.com`

## OAuth Flow
1. Click "Connect to Salesforce" in the app
2. You will be redirected to Salesforce login
3. Authorize LeadFlow Integration
4. You will be redirected back to the app
5. CRM data will load from your Salesforce org

## Docker Deployment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env
docker compose up --build
```

## CI/CD (Jenkins)
The Jenkinsfile handles:
- Dependency installation
- Frontend build
- Docker image build
- Deployment to production (main branch only)

## API Endpoints
- `GET  /api/auth/salesforce` — Start OAuth flow
- `GET  /api/auth/callback` — OAuth callback
- `GET  /api/auth/status` — Connection status
- `POST /api/auth/disconnect` — Disconnect
- `GET  /api/dashboard/stats` — Dashboard metrics
- `GET  /api/leads` — List leads
- `POST /api/leads` — Create lead
- `GET  /api/leads/:id` — Get lead
- `PATCH /api/leads/:id` — Update lead
- `DELETE /api/leads/:id` — Delete lead
- *(similar for `/api/accounts`, `/api/contacts`, `/api/opportunities`)*

## Security Notes
- Never commit `.env` files
- Salesforce tokens stored server-side only
- CORS restricted to frontend origin
