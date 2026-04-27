import { apiOrigin } from '../config';

/**
 * Turn stored upload paths (relative or absolute filesystem) into a browser URL.
 */
export function assetUrl(storedPath) {
  if (!storedPath) return null;
  const s = String(storedPath);
  if (s.startsWith('http') || s.startsWith('data:')) return s;
  const normalized = String(storedPath).replace(/\\/g, '/');
  const idx = normalized.indexOf('uploads/');
  const rel = idx >= 0 ? normalized.slice(idx) : normalized.replace(/^\/+/, '');
  if (!rel) return null;
  return apiOrigin ? `${apiOrigin}/${rel}` : `/${rel}`;
}
