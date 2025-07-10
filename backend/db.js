// db.js

import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,       // example: your-sql.database.windows.net
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

let pool;

export async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('❌ Azure SQL connection error:', err);
    throw err;
  }
}

export { sql };
