// API Configuration
// For production (Vercel), the API is served from the same domain
// For local development, use localhost:5000
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default API_URL;
