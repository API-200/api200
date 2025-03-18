import { Tables } from '../utils/database.types';
import { supabase } from '../utils/supabase';

export interface RequestProcessingMetadata {
    endpointId: number;
    startTime: Date;
    reqBody: any;
    reqHeaders: Record<string, string>;
    ip: string;
    reqUrl: string;
}

export const getLogData = (
    metadata: RequestProcessingMetadata,
    response: any,
    error: string | null,
    cacheHit: boolean,
    correlationId: string,
    isMockResponse: boolean,
    isFallbackResponse: boolean,
    retryNumber?: number,
    statusCode?: number,
) => {
    const finishedAt = new Date();
    const tookMs = finishedAt.getTime() - metadata.startTime.getTime();

    return {
        endpoint_id: metadata.endpointId,
        req_body: metadata.reqBody || null,
        req_headers: metadata.reqHeaders,
        res_body: response?.data,
        res_code: statusCode ?? response?.status,
        res_headers: response?.headers || null,
        started_at: metadata.startTime.toISOString(),
        finished_at: finishedAt.toISOString(),
        took_ms: tookMs,
        error: error || null,
        cache_hit: cacheHit,
        retry_number: retryNumber,
        correlation_id: correlationId,
        ip: metadata.ip,
        is_mock_response: isMockResponse,
        is_fallback_response: isFallbackResponse,
        req_url: metadata.reqUrl,
    } as Omit<Tables<'logs'>, 'id'>;
};

export const saveLog = async (log: Omit<Tables<'logs'>, 'id'>) => {
    const { error } = await supabase.from('logs').insert([log]);

    if (error) {
        console.error('Error logging to Supabase:', error);
    }
};
