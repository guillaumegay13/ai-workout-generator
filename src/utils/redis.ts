import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Test the connection
redis.set('test_key', 'test_value')
    .then(() => console.log('Redis connection successful'))
    .catch(error => console.error('Redis connection failed:', error));

export { redis };