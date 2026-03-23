// Centralized API helpers — ensure VITE_API_URL is defined and build safe URLs.
const raw = import.meta.env.VITE_API_URL;

export const API_URL = raw && String(raw).trim() ? String(raw).replace(/\/+$/, "") : null;

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_API_URL is not set. Frontend will fall back to http://localhost:5000 for API requests.\nSet VITE_API_URL in your .env to avoid this warning."
  );
}

export function withBase(path) {
  const base = API_URL || "http://localhost:5000";
  if (!path) return base;
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? path : "/" + path}`;
}

export async function apiFetch(path, options) {
  const url = withBase(path);
  return fetch(url, options);
}

export default { API_URL, withBase, apiFetch };
