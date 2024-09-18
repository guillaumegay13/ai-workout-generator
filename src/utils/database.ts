import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initDatabase() {
    await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      email TEXT,
      date DATE,
      count INTEGER,
      PRIMARY KEY (email, date)
    )
  `;
}

export { sql };