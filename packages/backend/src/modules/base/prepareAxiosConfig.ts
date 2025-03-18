import { Context } from 'koa';
import { AxiosRequestConfig } from 'axios';

export function prepareAxiosConfig(
    ctx: Context,
    safeHeaders: Record<string, string>,
    fullUrl: string,
): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
        method: ctx.method.toLowerCase(),
        url: fullUrl,
        headers: safeHeaders,
        data: ctx.request.body,
    };

    // Handle query parameters if they exist in ctx.query
    if (Object.keys(ctx.query).length > 0) {
        const urlObj = new URL(fullUrl);
        // Preserve existing query params and add new ones
        Object.entries(ctx.query).forEach(([key, value]) => {
            urlObj.searchParams.append(key, value as string);
        });
        config.url = urlObj.toString();
    }

    return config;
}
