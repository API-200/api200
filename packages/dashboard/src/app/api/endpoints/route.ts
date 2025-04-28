import { createClient } from '@/utils/supabase/server';
import { captureException } from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { dropCachedResults, dropServiceEndpointsCaches } from '../utils';

export async function POST(req: any) {
    const supabase = await createClient();
    try {
        const data = await req.json();

        const { data: resData, error } = await supabase
            .from('endpoints')
            .insert({
                name: data.name,
                full_url: data.fullUrl,
                method: data.method,
                cache_enabled: data.cacheEnabled,
                cache_ttl_s: data.cacheTtlS ? data.cacheTtlS : 0,
                retry_enabled: data.retryEnabled,
                retry_count: data.retryCount ? data.retryCount : 0,
                retry_interval_s: data.retryInterval ? data.retryInterval : 0,
                fallback_response_enabled: data.fallbackResponseEnabled,
                fallback_response: data.fallbackResponse,
                fallback_status_code: data.fallbackStatusCode ? data.fallbackStatusCode : 0,
                data_mapping_function: data.dataMappingFunction,
                data_mapping_enabled: data.dataMappingEnabled,
                mock_enabled: data.mockEnabled,
                mock_response: data.mockResponse,
                mock_status_code: data.mockStatusCode ? data.mockStatusCode : 0,
                service_id: data.serviceId,
                regex_path: '^' + data.name.replace(/{[^}]+}/g, '([^/]+)') + '$',
                custom_headers_enabled: data.customHeadersEnabled,
                custom_headers: data.customHeaders,
                path: data.path,
            })
            .select()
            .single();

        if (resData) {
            return NextResponse.json({ message: "Endpoint created successfully.", data: resData }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Something went wrong.', error: error?.message }, { status: 400 });
        }
    } catch (error: any) {
        console.log(error);
        return NextResponse.json({ message: 'Internal Server Error', error: error?.message }, { status: 500 });
    }
}

export async function PUT(req: any) {
    const supabase = await createClient();
    try {
        const data = await req.json();
        const { searchParams } = new URL(req.url);
        const endpointId = searchParams.get('id');

        const { error } = await supabase
            .from('endpoints')
            .update({
                name: data.name,
                full_url: data.fullUrl,
                method: data.method,
                cache_enabled: data.cacheEnabled,
                cache_ttl_s: data.cacheTtlS ? data.cacheTtlS : 0,
                retry_enabled: data.retryEnabled,
                retry_count: data.retryCount ? data.retryCount : 0,
                retry_interval_s: data.retryInterval ? data.retryInterval : 0,
                fallback_response_enabled: data.fallbackResponseEnabled,
                fallback_response: data.fallbackResponse,
                fallback_status_code: data.fallbackStatusCode ? data.fallbackStatusCode : 0,
                data_mapping_function: data.dataMappingFunction,
                data_mapping_enabled: data.dataMappingEnabled,
                mock_enabled: data.mockEnabled,
                mock_response: data.mockResponse,
                mock_status_code: data.mockStatusCode ? data.mockStatusCode : 0,
                service_id: data.serviceId,
                regex_path: '^' + data.name.replace(/{[^}]+}/g, '([^/]+)') + '$',
                custom_headers_enabled: data.customHeadersEnabled,
                custom_headers: data.customHeaders,
                path: data.path,
            })
            .eq('id', endpointId);

        if (error) {
            return NextResponse.json({ message: 'Failed to update endpoint', error: error.message }, { status: 400 });
        } else {
            try {
                await Promise.all([dropServiceEndpointsCaches(data.userId, data.serviceName), dropCachedResults(data.endpointId)]);
            } catch (error) {
                captureException(error);
                console.error('Redis cache set error in retrieveServiceRouteData:', error);
            }
            return NextResponse.json({ message: 'Endpoint updated successfully' }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: any) {
    const supabase = await createClient();
    try {
        const data = await req.json();

        const { error } = await supabase
            .from('endpoints')
            .delete()
            .eq('id', data.endpointId);

        if (error) {
            return NextResponse.json({ message: 'Failed to delete endpoint', error: error.message }, { status: 400 });
        } else {
            await dropCachedResults(data.endpointId);
            return NextResponse.json({ message: 'Endpoint deleted successfully' }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
