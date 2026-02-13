// API configuration:
// - If VITE_API_URL is set, it takes priority.
// - Local frontend (localhost/127.0.0.1) defaults to local backend.
// - Otherwise fallback to deployed backend URL.
const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? 'http://localhost:5000' : 'https://youtube-transcript-api.fly.dev');

export default API_URL;
