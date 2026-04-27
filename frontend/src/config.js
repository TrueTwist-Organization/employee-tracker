/** API origin without trailing slash. Empty = same origin (Vite proxy in dev, reverse proxy in prod). */
const raw = import.meta.env.VITE_API_BASE_URL;
export const apiOrigin =
  raw === undefined || raw === null || String(raw).trim() === ''
    ? ''
    : String(raw).replace(/\/$/, '');

export const apiBaseURL = apiOrigin ? `${apiOrigin}/api` : '/api';
