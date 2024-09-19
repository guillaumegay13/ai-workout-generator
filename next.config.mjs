/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GENERATE_WORKOUT_ENDPOINT: process.env.GENERATE_WORKOUT_ENDPOINT,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
};

export default nextConfig;
