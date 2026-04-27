# Deploy MiniHR (employee-tracker) on Vercel

This repo is configured for a **single Vercel project**: the Vite app is built into `public/`, and the **Express API** runs as one Vercel Function via root **`index.js`** (see [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)). Production builds use **hash routing** (`/#/admin`, etc.) so deep links work on the static CDN without extra rewrites.

## 1. Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Copy your project URL and server-only service role key from **Project Settings → API**.

## 2. Environment variables on Vercel

In the Vercel project: **Settings → Environment Variables**. Add for **Production** (and Preview if you want previews to work):

| Name | Value |
|------|--------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -base64 48`) |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | Your live URLs, comma-separated, e.g. `https://your-domain.com,https://www.your-domain.com` — include your `*.vercel.app` URL while testing |

Do **not** commit secrets. Use the Vercel dashboard only.

## 3. Create the Vercel project

1. Push this repository to GitHub (or GitLab / Bitbucket).
2. [Vercel Dashboard](https://vercel.com/new) → **Add New… → Project** → import the repo.
3. **Root Directory**: leave as the **repository root** (not `frontend/`).
4. Framework Preset: Vercel should pick up `vercel.json` (`framework: null`). If it tries to force “Vite” only, override so it uses the repo root and the `vercel.json` build/install commands.
5. **Build Command** / **Output Directory**: use the default **`npm run build`** from root `package.json` (it builds Vite and copies into `public/`). Do not rename this script to `vercel-build`, or Vercel may treat the project as static-only and skip the Express app in `index.js`).
6. **Install Command**: should match `vercel.json` (`npm install`).

Deploy.

## 4. Custom domain

**Project → Settings → Domains**: add your domain and follow DNS instructions (usually `CNAME` to `cname.vercel-dns.com`).

Update **`ALLOWED_ORIGINS`** to include the new `https://` origin.

## 5. First login on production

Run `npm run seed --workspace backend` locally with the production Supabase environment variables, or use the API registration endpoint to create your first user. The seed creates `admin@truetwist.com` / `Admin@123` — change the password after.

## 6. Files and uploads on Vercel

- On Vercel, **disk uploads are not durable**. The API uses **in-memory multer** and stores small images/PDFs as **base64 `data:` URLs** in Supabase Postgres (fine for demos; for production volume use Supabase Storage, S3, R2, or Vercel Blob later).
- Health check: `GET /api/health` → `MiniHR API is running...`

## 7. Troubleshooting

- **Supabase config error**: Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel for the environment you deployed.
- **401 / JWT**: Ensure `JWT_SECRET` is set and unchanged between deploys (rotating it invalidates existing tokens).
- **CORS**: Set `ALLOWED_ORIGINS` to the exact browser origin (scheme + host, no trailing slash).
- **Missing tables**: Run `supabase/schema.sql` in the Supabase SQL Editor before deploying.

## 8. Local commands (unchanged)

```bash
npm run dev
```

Uses `backend/server.js` (long-running Node) and Vite dev server with proxy — not the same as Vercel’s serverless runtime.
