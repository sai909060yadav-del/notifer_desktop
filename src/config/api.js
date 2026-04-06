const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const rawApiKey = (import.meta.env.VITE_API_KEY || '').trim();

// Dev defaults to local backend; production must use VITE_API_BASE_URL or same-origin /api routes.
export const API_BASE_URL = rawBase || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiHeaders = (headers = {}) => {
  if (!rawApiKey) return headers;
  return { ...headers, 'x-api-key': rawApiKey };
};

export const apiFetch = (path, options = {}) => {
  return fetch(apiUrl(path), {
    ...options,
    headers: apiHeaders(options.headers || {})
  });
};
