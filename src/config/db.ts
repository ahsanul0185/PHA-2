import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: config.db_connection_str,
});

const initDB = async () => {
  await pool.query(`

        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL CHECK (email = LOWER(email)),
            password TEXT NOT NULL CHECK (char_length(password) >= 6),
            phone VARCHAR(20) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);

};

export default initDB
