import Router from 'koa-router';

let retryNumber = 0;
const retriesTillSuccess = 3;

export const createTestRouter = () => {
    const router = new Router();
    router.get('/test/retry-test', async (ctx) => {
        if (retryNumber < retriesTillSuccess) {
            retryNumber++;
            ctx.status = 500;
            ctx.body = 'Error';
            return;
        }
        ctx.body = 'Success';
        retryNumber = 0;
    });

    router.get('/test/mock-test', async (ctx) => {
        ctx.status = 500;
        ctx.body = 'Mock function called, throwing error';
    });

    router.get('/test/fallback-test', async (ctx) => {
        ctx.status = 500;
        ctx.body = 'Fallback function called, throwing error';
    });

    router.get('/test/cache-test', async (ctx) => {
        ctx.status = 200;
        const date = new Date();
        ctx.body = 'Cache set on ' + date.toISOString();
    });

    router.get('/test/schema-change', async (ctx) => {
        ctx.status = 200;
        ctx.body = {
            a: 1,
            b: '2',
            c: {
                c1: 1,
                c2: [{ a: 1 }, { a: 2 }]
            }
        }
    })

    router.get('/test/headers', async (ctx) => {
        ctx.status = 200;
        ctx.body = JSON.stringify(ctx.headers)
    })

    return router;
};
