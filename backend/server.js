
'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const connectDB = require('./config/db');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('dev'));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
  name: 'leadflow.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user-auth', require('./routes/userAuth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    if (!process.env.SESSION_SECRET) {
      throw new Error('SESSION_SECRET is missing from environment variables');
    }

    app.listen(PORT, () => {
      console.log(`LeadFlow Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start LeadFlow:', error.message);
    process.exit(1);
  }
};

startServer();
