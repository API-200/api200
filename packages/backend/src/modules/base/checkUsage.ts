import { supabase } from '../../utils/supabase';
import { BASIC_PLAN_MAX_REQUESTS } from '../../utils/constants';

export async function checkUsage(
    userId: string,
): Promise<{ error?: string; status?: number }> {
    const { data, error } = await supabase.rpc('increment_usage', {
        p_user_id: userId,
        p_max_requests: BASIC_PLAN_MAX_REQUESTS,
    });

    if (error) {
        console.error('Error incrementing usage:', error);
        return { error: 'API200 Error: Internal server error', status: 500 };
    }

    // The first row contains our result
    const result = data?.[0];

    if (!result?.allowed) {
        return {
            error: `API200 Error: Monthly usage limit exceeded (${result?.c_count}/${BASIC_PLAN_MAX_REQUESTS})`,
            status: 429,
        };
    }

    return {};
}
