import { createCache } from 'cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { config } from './config';

export const cache = createCache({
    stores: [
        new Keyv({
            store: new KeyvRedis(config.REDIS_URL),
        }),
    ],
});
