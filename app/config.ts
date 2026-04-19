const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isLocal ? 'http://localhost:5000' : 'https://astroconvoy.onrender.com');

export default API_URL;
