const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection details
const pool = new Pool({
    host: 'mnz.domcloud.co',
    database: 'imaginary_promotion_waw_db',
    user: 'imaginary-promotion-waw',
    password: 'Cs7E_NMY9urp_v19(7',
    port: 5432,
});

// Configuration for the batch process
const batchSize = 10000; // Number of users to create in each batch
const batchDuration = 10 * 100000; // Duration for each batch in milliseconds (10 seconds)

// Function to generate a random username and password
function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Function to insert a unique user account
async function createAccount() {
    const username = generateRandomString(8);
    const password = generateRandomString(12);

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rowCount === 0) {
            // Insert new user if username is unique
            await pool.query(
                'INSERT INTO users (username, password) VALUES ($1, $2)',
                [username, password]
            );
            console.log(`New user created: Username: ${username}, Password: ${password}`);
        }
    } catch (error) {
        console.error('Error inserting user:', error);
    }
}

// Function to create a batch of accounts
async function createAccountsBatch() {
    console.log(`Starting batch of ${batchSize} accounts...`);
    const tasks = [];

    for (let i = 0; i < batchSize; i++) {
        tasks.push(createAccount());
    }

    await Promise.all(tasks);
    console.log(`Batch of ${batchSize} accounts created.`);
}

// Function to continuously run the batch process without a break
function startContinuousCreation() {
    async function batchLoop() {
        await createAccountsBatch();
        batchLoop(); // Restart the batch immediately
    }

    batchLoop(); // Start the first batch
}

// Start the continuous creation process
startContinuousCreation();