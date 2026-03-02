// API configuration:
// - If VITE_API_URL is set, it takes priority.
// - Local app (localhost/127.0.0.1) defaults to local backend.
// - Otherwise use same origin (best for Vercel app+API in one project).
const hasWindow = typeof window !== 'undefined';
const isLocalHost =
  hasWindow &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const sameOrigin = hasWindow ? window.location.origin : '';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? 'http://localhost:5000' : sameOrigin || 'https://www.transcripta.tech');

export default API_URL;
