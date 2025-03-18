import { AxiosError } from 'axios';
import { FallbackData } from '../provideFallbackData';
import { Context } from 'koa';
import {
    getLogData,
    RequestProcessingMetadata,
    saveLog,
} from '../logging';
import Sentry from '@sentry/node';

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
            saveLog(logData);
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
        saveLog(logData);
    }

    ctx.status = status;
    ctx.body = {
        error: typedError.message,
        details: typedError.response?.data,
        api200: 'This is not API200 error. It occurred in your API. Check details',
    };
}
