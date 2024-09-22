import { redis } from './redis';

export enum RateLimitStatus {
  OK = 'OK',
  EMAIL_LIMIT_EXCEEDED = 'EMAIL_LIMIT_EXCEEDED',
  GLOBAL_LIMIT_EXCEEDED = 'GLOBAL_LIMIT_EXCEEDED'
}

export async function checkRateLimit(email: string, emailLimit: number, globalLimit: number): Promise<RateLimitStatus> {
  const today = new Date().toISOString().split('T')[0];
  const emailKey = `rate_limit:${email}:${today}`;
  const globalKey = `rate_limit:global:${today}`;

  // Use multi to execute commands atomically
  const multi = redis.multi();
  multi.incr(emailKey);
  multi.incr(globalKey);
  multi.expire(emailKey, 86400);
  multi.expire(globalKey, 86400);

  const [emailCount, globalCount] = await multi.exec() as [number, number, null, null];

  if (emailCount > emailLimit) {
    return RateLimitStatus.EMAIL_LIMIT_EXCEEDED;
  }

  if (globalCount > globalLimit) {
    return RateLimitStatus.GLOBAL_LIMIT_EXCEEDED;
  }

  return RateLimitStatus.OK;
}