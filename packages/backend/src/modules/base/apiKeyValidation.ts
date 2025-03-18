import { Context } from 'koa';
import { cache } from '../../utils/cache';
import { DAY } from '../../utils/constants';
import Sentry from '@sentry/node';
import { supabase } from '../../utils/supabase';

const generateApiKeyHash = (apiKey: string) => `apikey:${apiKey}`;

export async function validateApiKey(
    ctx: Context,
): Promise<{ user_id: string } | null> {
    const apiKey = ctx.get('x-api-key');

    if (!apiKey) {
        ctx.status = 401;
        ctx.body = { error: 'API200 Error: API key is required' };
        return null;
    }

    const cacheKey = generateApiKeyHash(apiKey);

    try {
        const cachedData = await cache.get<{ user_id: string }>(cacheKey);
        if (cachedData) {
            return cachedData;
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error('Cache error in validateApiKey:', error);
    }

    const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('user_id')
        .eq('key', apiKey)
        .single();

    if (keyError || !keyData) {
        ctx.status = 401;
        ctx.body = { error: 'API200 Error: Invalid API key' };
        return null;
    }

    try {
        cache.set(cacheKey, keyData, DAY);
    } catch (error) {
        Sentry.captureException(error);
        console.error('Redis cache set error in validateApiKey:', error);
    }

    return keyData;
}
