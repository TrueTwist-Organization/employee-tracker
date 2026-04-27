require('dotenv').config();

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in production (use a long random string).');
    process.exit(1);
  }
  process.env.JWT_SECRET = 'dev-only-not-for-production';
}

const fs = require('fs');
const path = require('path');
const { buildApp } = require('./app');
const { connectDatabase } = require('./db');

const PORT = process.env.PORT || 5001;
const publicIndex = path.join(process.cwd(), 'public', 'index.html');

const app = buildApp({
  withDbMiddleware: false,
  enableSpaFallback: fs.existsSync(publicIndex),
});

const hasSupabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

async function start() {
  if (hasSupabaseConfig) {
    await connectDatabase();
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production.');
  } else {
    console.warn('Supabase is not configured yet. API routes will return 503 until backend/.env is set.');
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
