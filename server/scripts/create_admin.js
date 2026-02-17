const bcrypt = require('bcrypt');
const db = require('../db/db');

async function createAdmin() {
    const args = process.argv.slice(2);
    const username = args[0] || 'admin';
    const password = args[1] || 'SecureAdmin123!';

    if (!username || !password) {
        console.error('Usage: node create_admin.js <username> <password>');
        process.exit(1);
    }

    try {
        console.log(`Creating admin user: ${username}`);

        // 1. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 2. Insert into DB (Upsert - on conflict update password)
        const query = `
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, 'admin')
            ON CONFLICT (username) 
            DO UPDATE SET password_hash = $2;
        `;

        await db.query(query, [username, passwordHash]);

        console.log('✅ Admin user created/updated successfully.');
        console.log(`User: ${username}`);
        console.log('Password: [HIDDEN]');

    } catch (err) {
        console.error('❌ Error creating admin user:', err);
    } finally {
        // End the pool to exit the script
        db.pool.end();
    }
}

createAdmin();
