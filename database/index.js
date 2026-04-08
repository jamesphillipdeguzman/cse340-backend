/**
 * database/index.js
 * Refactored to work with Aiven PostgreSQL
 * Changes:
 *  - Always enable SSL (required by Aiven)
 *  - Unified export of query and pool
 *  - Added optional logging in development
 */

const { Pool } = require("pg");
require("dotenv").config();

// ---------------------------
// Connection Pool Setup
// ---------------------------
// Always use SSL for Aiven, even in production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // CHANGED: Required for Aiven SSL connections
});

// ---------------------------
// Query wrapper
// ---------------------------
// Adds optional logging in development for easier debugging
async function query(text, params) {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Executing query:", { text, params });
    }
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error("Error in query:", { text, params, err });
    throw err;
  }
}

// ---------------------------
// Export
// ---------------------------
// Export both query (for normal queries) and pool (for session store)
module.exports = {
  pool,
  query,
};
