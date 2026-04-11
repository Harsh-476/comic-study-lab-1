// Centralized API helpers - ensure VITE_API_URL is defined and build safe URLs.
export const BASE_URL = import.meta.env.VITE_API_URL;

const normalizedBaseUrl =
  BASE_URL && String(BASE_URL).trim() ? String(BASE_URL).replace(/\/+$/, "") : null;

if (!normalizedBaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_API_URL is not set. API requests will be made relative to the current origin.\nSet VITE_API_URL in your .env to point to your backend (e.g. https://api.example.com)"
  );
}

export function withBase(path) {
  // If BASE_URL is provided use absolute URL, otherwise return a relative path so
  // requests go to the same origin as the frontend.
  if (!normalizedBaseUrl) {
    if (!path) return "";
    return path.startsWith("/") ? path : "/" + path;
  }
  if (!path) return normalizedBaseUrl;
  return `${normalizedBaseUrl}${path.startsWith("/") ? path : "/" + path}`;
}

export async function apiFetch(path, options) {
  const url = withBase(path);
  return fetch(url, options);
}

export default { BASE_URL, withBase, apiFetch };
