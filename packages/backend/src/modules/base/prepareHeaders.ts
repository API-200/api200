import { Context } from 'koa';

export function prepareHeaders(ctx: Context, customHeadersEnabled: boolean, customHeaders: any): Record<string, string> {
    const headers = { ...ctx.headers, ...(customHeadersEnabled && customHeaders || {})  } as Record<string, string>;
    delete headers['content-length']; // let axios set correct content-length
    delete headers['x-api-key'];
    delete headers['host'];
    return headers;
}
