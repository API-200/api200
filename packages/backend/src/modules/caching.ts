import { Tables } from '../utils/database.types';
import { AxiosResponse } from 'axios';
import { Context } from 'koa';
import { cache } from '../utils/cache';

export interface ICacheValue {
    data: any;
    status: number;
    headers: Record<string, string>;
}

export const tryGetCache = async (
    ctx: Context,
    endpointData: Tables<'endpoints'>,
): Promise<ICacheValue | null> => {
    if (endpointData.cache_enabled) {
        return await cache.get(getCacheKey(ctx, endpointData));
    }

    return null;
};

export const trySetCache = async (
    ctx: Context,
    endpointData: Tables<'endpoints'>,
    response: AxiosResponse,
) => {
    if (response.data == null) {
        return;
    }

    if (endpointData.cache_enabled) {
        await cache.set(
            getCacheKey(ctx, endpointData),
            getCacheValue(response),
            endpointData.cache_ttl_s! * 1000,
        );
    }
};

const getCacheKey = (ctx: Context, endpointData: Tables<'endpoints'>) => {
    return `res:${endpointData.id}:${ctx.querystring}`;
};

const getCacheValue = (response: AxiosResponse): ICacheValue => {
    return {
        data: response.data,
        status: response.status,
        headers: normalizeHeaders(response.headers),
    };
};

const normalizeHeaders = (headers: any): Record<string, string> => {
    const normalized: Record<string, string> = {};

    if (headers && typeof headers === 'object') {
        Object.entries(headers).forEach(([key, value]) => {
            normalized[key] = String(value);
        });
    }

    return normalized;
};
