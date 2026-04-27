const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const salaryRoutes = require('./routes/salary');

function buildApp(options = {}) {
  const { withDbMiddleware = true, enableSpaFallback = false } = options;

  const app = express();
  app.set('trust proxy', 1);

  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  const corsOptions =
    allowedOrigins && String(allowedOrigins).trim()
      ? {
          origin: String(allowedOrigins)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          credentials: true,
        }
      : { origin: true };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '12mb' }));

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) return next();
    if (req.path === '/api/health') return next();
    if (process.env.VERCEL === '1' && !process.env.JWT_SECRET) {
      return res.status(503).json({
        message:
          'Missing JWT_SECRET. Add it in Vercel → Project → Settings → Environment Variables.',
      });
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({
        message:
          'Missing Supabase config. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env or hosting environment variables.',
      });
    }
    next();
  });

  if (withDbMiddleware) {
    app.use(async (req, res, next) => {
      if (req.method === 'OPTIONS') return next();
      try {
        await connectDatabase();
        next();
      } catch (e) {
        next(e);
      }
    });
  }

  if (process.env.VERCEL !== '1') {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/salary', salaryRoutes);

  app.get('/api/health', (req, res) => {
    res.send('MiniHR API is running...');
  });

  if (enableSpaFallback) {
    const indexFile = path.join(process.cwd(), 'public', 'index.html');
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'Not found' });
      }
      if (!fs.existsSync(indexFile)) return next();
      return res.sendFile(indexFile, (err) => {
        if (err) next(err);
      });
    });
  }

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  });

  return app;
}

module.exports = { buildApp };
