import Router from 'koa-router';
import { validateApiKey } from './modules/base/apiKeyValidation';
import { retrieveServiceRouteData } from './modules/base/retrieveServiceRouteData';
import { checkUsage } from './modules/base/checkUsage';
import {
    extractFallbackData,
    FallbackData,
} from './modules/provideFallbackData';
import { provideMockData } from './modules/provideMockData';
import { handleRequest } from './modules/handleRequest';
import { handleGlobalError } from './modules/base/handleGlobalError';
import { prepareHeaders } from './modules/base/prepareHeaders';
import {
    RequestProcessingMetadata,
    getLogData,
    saveLog,
} from './modules/logging';
import { randomUUID } from 'crypto';
import Sentry from '@sentry/node';
import { getFullUrlWithParams } from './modules/base/mapUrlParams';
import { applyThirdPartyAuth } from './modules/applyThirdPartyAuth';
import { prepareAxiosConfig } from './modules/base/prepareAxiosConfig';
import FEATURES from './features';

export const createApiHandlerRouter = () => {
    const router = new Router();

    router.all('/api/:serviceName/*endpointName', async (ctx) => {
        const correlationId = randomUUID();
        let fallbackData: FallbackData | null = null;
        let requestMetadata: RequestProcessingMetadata | null = null;

        try {
            // Validate API key
            const keyData = await validateApiKey(ctx);
            if (!keyData) return;

            // Get metadata
            const metadata = {
                serviceName: ctx.params.serviceName,
                endpointName: ctx.params.endpointName,
                method: ctx.params.method,
                userId: keyData.user_id,
            };

            if (FEATURES.CHECK_USAGE) {
                const usageCheck = await checkUsage(metadata.userId);
                if (usageCheck.error) {
                    ctx.status = usageCheck.status!;
                    ctx.body = { error: usageCheck.error };
                    return;
                }
            }

            // Get route data
            const { routeData, routeError } =
                await retrieveServiceRouteData(metadata);
            if (!routeData) {
                ctx.status = 404;
                ctx.body = {
                    error: 'API200 Error: Service or endpoint not found',
                    details: `${routeError?.message} ${routeError?.details}`,
                };
                return;
            }

            const endpointData = (routeData as any).endpoints[0];
            endpointData.full_url = getFullUrlWithParams(
                endpointData,
                metadata.endpointName,
            );
            fallbackData = extractFallbackData(endpointData);

            let requestHeaders = prepareHeaders(ctx);
            let axiosConfig = prepareAxiosConfig(
                ctx,
                requestHeaders,
                endpointData.full_url,
            );

            if ((routeData as any).auth_enabled) {
                const { headers, config } = applyThirdPartyAuth(
                    routeData as any,
                    requestHeaders,
                    axiosConfig,
                );
                axiosConfig = config;
                requestHeaders = headers;
                axiosConfig.headers = headers;
            }

            requestMetadata = {
                endpointId: endpointData.id,
                startTime: new Date(),
                reqBody: ctx.request.body,
                reqHeaders: prepareHeaders(ctx),
                ip: ctx.request.ip,
                reqUrl: axiosConfig.url!,
            };

            // Validate HTTP method
            if (ctx.method !== endpointData.method) {
                ctx.status = 405;
                ctx.body = {
                    error: `API200 Error: Method ${ctx.method} not configured for this endpoint`,
                };
                const logData = getLogData(
                    requestMetadata,
                    null,
                    'Method not allowed',
                    false,
                    correlationId,
                    false,
                    false,
                );
                saveLog(logData);
                return;
            }

            // Check for mock data
            const mockResponse = provideMockData(endpointData);
            if (mockResponse) {
                ctx.status = mockResponse.status;
                ctx.body = mockResponse.body;
                if (ctx.response.get('transfer-encoding')) {
                    ctx.response.remove('content-length');
                }
                const logData = getLogData(
                    requestMetadata,
                    mockResponse,
                    null,
                    false,
                    correlationId,
                    true,
                    false,
                );
                saveLog(logData);
                return;
            }

            // Handle the main request
            const { status, body, headers } = await handleRequest(
                keyData.user_id,
                ctx,
                endpointData,
                requestHeaders,
                axiosConfig,
            );
            ctx.status = status;
            ctx.body = body;
            ctx.set(headers);
            if (ctx.response.get('transfer-encoding')) {
                ctx.response.remove('content-length');
            }
        } catch (error) {
            Sentry.captureException(error);
            handleGlobalError(
                ctx,
                error as Error,
                fallbackData,
                correlationId,
                requestMetadata,
            );
        }
    });
    return router;
};
