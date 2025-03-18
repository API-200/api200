import { Context } from 'koa';

export function prepareHeaders(ctx: Context): Record<string, string> {
    const headers = { ...ctx.headers } as Record<string, string>;
    delete headers['x-api-key'];
    delete headers['host'];
    return headers;
}
