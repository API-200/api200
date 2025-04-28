import { getRedisClient } from '@/utils/redis/cache';

export async function dropServiceEndpointsCaches(userId: string, serviceName: string) {
    const redisClient = await getRedisClient();
    console.log(`keyv::keyv:route:${userId}:${serviceName}:*`)
    const endpointsKeys = await redisClient.keys(`keyv::keyv:route:${userId}:${serviceName}:*`);

    if (endpointsKeys.length) {
        await redisClient.del(endpointsKeys)
    }
}

export async function dropCachedResults(endpointId: string) {
    const redisClient = await getRedisClient();
    const endpointKeys = await redisClient.keys(`keyv::keyv:res:${endpointId}:*`);

    if (endpointKeys.length) {
        await redisClient.del(endpointKeys);
    }
}
