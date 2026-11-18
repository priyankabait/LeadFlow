require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');

const app = express();

// ─── Trust proxy (for secure cookies behind nginx/load-balancer in production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── Security headers
app.use(helmet());

// ─── HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// ─── Body parsing
app.use(express.json({ limit: '1mb' }));

// ─── Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'leadflow-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ─── Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ─── Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Error handler (must be last)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`LeadFlow Backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
