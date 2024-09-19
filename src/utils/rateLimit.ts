import { redis } from './redis';

export async function isRateLimited(email: string, limit: number): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const key = `rate_limit:${email}:${today}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 86400); // Set expiry for 24 hours
  }

  return count > limit;
}