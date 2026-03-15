const { Pool } = require('pg');
const path = require('path');
// Use absolute path for .env relative to this file's directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create a new pool instance used to manage database connections
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'cootransures_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Listener for logging connections (Optional)
pool.on('connect', () => {
    // console.log('Base de datos conectada exitosamente');
});

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de base de datos', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
