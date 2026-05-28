const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'dpg-d8bhk6vavr4c739k4n2g-a.oregon-postgres.render.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pharmalinkdatabase',
  user: process.env.DB_USER || 'rist',
  password: process.env.DB_PASSWORD || 'r7B6Ah3KFrUQSiDCp33leBf02V9qqgv2',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = { pool };
