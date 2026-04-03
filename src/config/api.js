const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

// Dev defaults to local backend; production must use VITE_API_BASE_URL or same-origin /api routes.
export const API_BASE_URL = rawBase || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
