import { supabase } from '../../utils/supabase';
import { cache } from '../../utils/cache';
import { DAY } from '../../utils/constants';
import Sentry from '@sentry/node';

const generateRouteHash = (metadata: {
    serviceName: string;
    endpointName: string;
    userId: string;
}) =>
    `route:${metadata.userId}:${metadata.serviceName}:${metadata.endpointName}`;

export async function retrieveServiceRouteData(metadata: {
    serviceName: string;
    endpointName: string;
    userId: string;
    method: string;
}) {
    const cacheKey = generateRouteHash(metadata);

    try {
        const cachedData = await cache.get<typeof routeData>(cacheKey);
        if (cachedData) {
            return { routeData: cachedData, routeError: null };
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error('Redis cache error in retrieveServiceRouteData:', error);
    }

    const { data: routeData, error: routeError } = await supabase.rpc(
        'get_route_data',
        {
            p_service_name: metadata.serviceName,
            p_user_id: metadata.userId,
            p_method: metadata.method,
            p_endpoint_name: `/${metadata.endpointName}`,
        },
    );

    if (routeError || !routeData) {
        return { routeData: null, routeError };
    }

    try {
        cache.set(cacheKey, routeData, DAY);
    } catch (error) {
        Sentry.captureException(error);
        console.error(
            'Redis cache set error in retrieveServiceRouteData:',
            error,
        );
    }

    return { routeData, routeError };
}
