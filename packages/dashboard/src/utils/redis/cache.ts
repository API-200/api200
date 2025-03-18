import { createCache } from 'cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { env } from 'next-runtime-env';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const redis = require('redis');

let redisClient: any;
export const getRedisClient = async () => {
    if (redisClient) {
        return redisClient;
    }

    redisClient = await redis.createClient({
        url: env('REDIS_URL')
    });

    await redisClient.connect();

    return redisClient;
}

export const cache = createCache({
    stores: [
        new Keyv({
            store: new KeyvRedis(env('REDIS_URL')),
        }),
    ],
});
