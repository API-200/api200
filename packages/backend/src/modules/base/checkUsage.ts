import { PLANS } from '@utils/constants';
import { supabase } from '../../utils/supabase';

export async function checkUsage(
    userId: string,
): Promise<{ error?: string; status?: number }> {

    const { data: proSubscriptionExists, error: subscriptionCheckError } = await supabase.rpc('check_subscription', { p_user_id: userId });
    const maxRequests = proSubscriptionExists ? PLANS.PRO.REQUESTS_PER_MONTH : PLANS.BASIC.REQUESTS_PER_MONTH;

    if (subscriptionCheckError) {
        console.error('Error checking subscription:', subscriptionCheckError);
        return { error: 'API200 Error: Internal server error', status: 500 };
    }

    const { data, error } = await supabase.rpc('increment_usage', {
        p_user_id: userId,
        p_max_requests: maxRequests,
    });

    if (error) {
        console.error('Error incrementing usage:', error);
        return { error: 'API200 Error: Internal server error', status: 500 };
    }

    // The first row contains our result
    const result = data?.[0];

    if (!result?.allowed) {
        return {
            error: `API200 Error: Monthly usage limit exceeded (${result?.c_count}/${maxRequests})`,
            status: 429,
        };
    }

    return {};
}
