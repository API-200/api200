import { AxiosError } from 'axios';
import { FallbackData } from '../provideFallbackData';
import { Context } from 'koa';
import {
    getLogData,
    RequestProcessingMetadata,
    saveLog,
} from '../logging';
import Sentry, { captureException } from '@sentry/node';
import { supabase } from '@utils/supabase';

const isValidHttpStatusCode = (status: unknown): boolean => {
    if (typeof status !== 'number' || !Number.isFinite(status)) {
        return false;
    }
    return status >= 100 && status < 600;
};

const getDefaultStatus = (status?: number): number => isValidHttpStatusCode(status) ? status! : 500;

export function handleGlobalError(
    ctx: Context,
    error: Error,
    fallbackData: FallbackData | null,
    correlationId: string,
    requestMetadata?: RequestProcessingMetadata | null,
) {
    console.error('Dynamic routing error');

    const typedError = error as AxiosError;
    Sentry.captureException(error);

    const status = getDefaultStatus(typedError.status);

    if (fallbackData?.enabled) {
        ctx.status = fallbackData.code;
        ctx.body = fallbackData.response;

        if (requestMetadata) {
            const logData = getLogData(
                requestMetadata,
                typedError.response,
                typedError.message,
                false,
                correlationId,
                false,
                true,
                undefined,
                status
            );
            saveLog(logData).then(() => saveIfIncident(requestMetadata.endpointId, status, typedError.message));
        }
        return;
    }

    if (requestMetadata) {
        const logData = getLogData(
            requestMetadata,
            typedError.response,
            error.message,
            false,
            correlationId,
            false,
            false,
            undefined,
            status
        );
        saveLog(logData).then(() => saveIfIncident(requestMetadata.endpointId, status, typedError.message));
    }

    ctx.status = status;
    ctx.body = {
        error: typedError.message,
        details: typedError.response?.data,
        api200: 'This is not API200 error. It occurred in your API. Check details',
    };
}

async function saveIfIncident(endpointId: number, status: number, message: string): Promise<void> {
    try {
        const logsBy24h = await supabase.from('logs')
            .select('res_code', { count: 'exact' })
            .eq('endpoint_id', endpointId)
            .eq('res_code', status)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const maxErrorCount = 3;

        if ((logsBy24h?.count ?? 0) >= maxErrorCount) {
            const existingIncident = await supabase.from('incidents')
                .select('id')
                .eq('endpoint_id', endpointId)
                .eq('resolved', false)
                .eq('type', status.toString())
                .maybeSingle();

            if (!existingIncident.data) {
                await supabase.from('incidents').insert({
                    endpoint_id: endpointId,
                    title: `Error ${status}`,
                    details: message,
                    type: status.toString(),
                    resolved: false
                });
            }
        }
    }
    catch (error) {
        captureException(error);
    }
}