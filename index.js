import express from 'express';
import cors from 'cors';
import authenticate from './src/middlewares/authenticate.middleware.js';
import authorize from './src/middlewares/authorize.middleware.js';
import { imap_authorize, smtp_authorize } from './src/middlewares/protocol.middleware.js';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import imapRoutes from './src/routes/imap.routes.js';
import smtpRoutes from './src/routes/smtp.routes.js';

dotenv.config();

// Global safety net: prevent IMAP ECONNRESET or any other unhandled
// error/rejection from crashing the WrapMail server process entirely.
process.on('uncaughtException', (err) => {
  console.error('[WrapMail] Uncaught Exception (server kept alive):', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[WrapMail] Unhandled Promise Rejection (server kept alive):', reason);
});

const app = express();
const port = process.env.PORT || 3000;
const base = '/api';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to WrapMail!' });
});

app.get(`${base}/`, (req, res) => {
  res.json({ message: 'Welcome to WrapMail API!' });
});

app.use(authenticate);

app.use(`${base}/auth`, authRoutes);

app.use(authorize);

app.use(`${base}/imap`, imap_authorize, imapRoutes);
app.use(`${base}/smtp`, smtp_authorize, smtpRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});