// Centralized API helpers - ensure VITE_API_URL is defined and build safe URLs.
const rawBaseUrl = import.meta.env.VITE_API_URL;

export const BASE_URL =
  rawBaseUrl && String(rawBaseUrl).trim() ? String(rawBaseUrl).replace(/\/+$/, "") : "";

if (!BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_API_URL is not set. API requests will be made relative to the current origin.\nSet VITE_API_URL in your .env to point to your backend (e.g. https://api.example.com)"
  );
}

export function withBase(path) {
  // If BASE_URL is provided use absolute URL, otherwise return a relative path so
  // requests go to the same origin as the frontend.
  if (!BASE_URL) {
    if (!path) return "";
    return path.startsWith("/") ? path : "/" + path;
  }
  if (!path) return BASE_URL;
  return `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
}

export async function apiFetch(path, options) {
  const url = withBase(path);
  return fetch(url, options);
}

export default { BASE_URL, withBase, apiFetch };
