import { validateApiKey } from '@modules/base/apiKeyValidation';
import { supabase } from '@utils/supabase';
import Router from 'koa-router';

export const createUserRouter = () => {
    const router = new Router({ prefix: '/user' });

    router.get('/mcp-services', async (ctx) => {
        const keyData = await validateApiKey(ctx);
        if (!keyData) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized' };
            return;
        }

        const mcpServices = await supabase
            .from('services')
            .select('*, endpoints(*)')
            .eq('is_mcp_enabled', true)
            .eq('user_id', keyData.user_id);

        if (mcpServices.error) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch MCP services' };
            return;
        }

        ctx.status = 200;
        ctx.body = mcpServices.data;
    });

    return router;
}