# Database Setup Update

This project has been migrated away from MongoDB. New setup should use **Supabase**.

Use `SUPABASE_SETUP.md` for the current database setup and migration steps.

## Quick Supabase Steps

1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Create `backend/.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
JWT_SECRET=replace-with-a-long-random-secret
PORT=5001
NODE_ENV=development
```

4. Seed the demo admin:

```bash
cd backend
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Demo admin login:

- Email: `admin@truetwist.com`
- Password: `Admin@123`

## Migrating Old MongoDB Data

If you already have MongoDB data, stop the dev server first, configure Supabase env vars, then run:

```bash
cd backend
npm run migrate:mongo-to-supabase
```
