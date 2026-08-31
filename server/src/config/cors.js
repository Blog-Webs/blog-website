// ── Centralized CORS origin validator ─────────────────────────────────────

const DEFAULT_ALLOWED_ORIGINS = [
  'https://httptechnex.online',
  'https://www.httptechnex.online',
  'https://httptechnex.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

function getCustomOrigins() {
  if (!process.env.CLIENT_URL) return [];
  return process.env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow non-browser requests (Postman, curl, server-to-server)

  const custom = getCustomOrigins();
  const allOrigins = [...DEFAULT_ALLOWED_ORIGINS, ...custom];

  if (allOrigins.includes(origin)) {
    return true;
  }

  // Allow subdomains for httptechnex.online, vercel.app preview deployments, and local dev
  if (
    origin.endsWith('.httptechnex.online') ||
    origin.endsWith('.vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    return true;
  }

  return false;
}

module.exports = {
  isAllowedOrigin,
  DEFAULT_ALLOWED_ORIGINS,
};
