const { Pool } = require('pg');

const isPlaceholderUrl = (url) => {
  if (!url) return true;
  return url.includes('username:password@host') || url.includes('your-host');
};

const hasValidUrl = process.env.DATABASE_URL && !isPlaceholderUrl(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: hasValidUrl ? process.env.DATABASE_URL : undefined,
  connectionTimeoutMillis: 5000,
  ssl: hasValidUrl ? { rejectUnauthorized: false } : false
});

module.exports = pool;
