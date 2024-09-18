import { sql } from './database';

export async function isRateLimited(email: string, limit: number): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
    INSERT INTO rate_limits (email, date, count)
    VALUES (${email}, ${today}, 1)
    ON CONFLICT (email, date) DO UPDATE
    SET count = rate_limits.count + 1
    RETURNING count
  `;

    return result[0].count > limit;
}

export async function cleanupOldEntries() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await sql`DELETE FROM rate_limits WHERE date < ${yesterdayStr}`;
}