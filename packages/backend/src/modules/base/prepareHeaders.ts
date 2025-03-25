import { Context } from 'koa';

export function prepareHeaders(ctx: Context): Record<string, string> {
    const headers = { ...ctx.headers } as Record<string, string>;
    delete headers['content-length']; // let axios set correct content-length
    delete headers['x-api-key'];
    delete headers['host'];
    return headers;
}
