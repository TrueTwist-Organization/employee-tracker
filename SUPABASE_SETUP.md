# Supabase Setup

## 1. Create Tables

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Run the SQL from `supabase/schema.sql`.

## 2. Configure Environment Variables

Create `backend/.env` locally and set the same values in your hosting dashboard:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
JWT_SECRET=replace-with-a-long-random-secret
PORT=5001
NODE_ENV=development
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## 3. Seed Demo Admin

```bash
cd backend
npm run seed
```

Demo admin login:

- Email: `admin@truetwist.com`
- Password: `Admin@123`

## 4. Migrate Existing MongoDB Data

Stop the dev server first if it is using `backend/local_mongo_db`, then run:

```bash
cd backend
npm run migrate:mongo-to-supabase
```

If your data is in a real MongoDB server, set `MONGO_URI` temporarily in `backend/.env` before running the migration. The app itself no longer needs `MONGO_URI` after migration.
