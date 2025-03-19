import { Context } from 'koa';
import axios, { AxiosRequestConfig } from 'axios';
import { getLogData, RequestProcessingMetadata, saveLog } from './logging';
import { Tables } from '../utils/database.types';
import { tryGetCache, trySetCache } from './caching';
import { retry } from './retry';
import { randomUUID } from 'crypto';
import { checkResponseSchema } from './checkResponseSchema';
import toJsonSchema from 'to-json-schema';

const methodsToWatchResponseSchema = ['get', 'post', 'put'];

export async function processRequest(
    safeHeaders: Record<string, string>,
    endpointData: Tables<'endpoints'>,
    ctx: Context,
    axiosConfig: AxiosRequestConfig,
): Promise<{ data: any; status: number; headers: Record<string, string> }> {
    const correlationId = randomUUID();
    const metadata: RequestProcessingMetadata = {
        endpointId: endpointData.id,
        startTime: new Date(),
        reqBody: ctx.request.body,
        reqHeaders: safeHeaders,
        ip: ctx.request.ip,
        reqUrl: axiosConfig.url!,
    };

    let response: any;
    let cacheHit = false;

    const cached = endpointData.cache_enabled
        ? await tryGetCache(ctx, endpointData)
        : null;
    if (cached) {
        response = cached;
        cacheHit = true;
    } else {
        for await (const { response: result, retryNumber } of retry(
            axiosConfig,
            endpointData.retry_count,
            endpointData.retry_interval_s,
        )) {
            response = result;
            if (!axios.isAxiosError(result)) {
                break;
            }

            // if (endpointData.retry_enabled) {
            //     const logData = getLogData(
            //         metadata,
            //         null,
            //         null,
            //         false,
            //         correlationId,
            //         false,
            //         false,
            //         retryNumber,
            //     );
            //     saveLog(logData);
            // }
        }
    }

    if (axios.isAxiosError(response)) {
        throw response;
    }

    const logData = getLogData(
        metadata,
        response,
        null,
        cacheHit,
        correlationId,
        false,
        false,
    );
    saveLog(logData);

    if (endpointData.cache_enabled && !cacheHit) {
        trySetCache(ctx, endpointData, response);
    }

    const responseData = response.data;

    if (methodsToWatchResponseSchema.includes(ctx.method.toLowerCase())) {
        const responseSchema = toJsonSchema(responseData, { strings: { detectFormat: false } })
        checkResponseSchema(endpointData.id, responseSchema);
    }

    return {
        data: responseData,
        status: response.status,
        headers: response.headers,
    };
}