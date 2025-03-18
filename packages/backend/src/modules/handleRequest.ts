import { processRequest } from './processRequest';
import { executeUserFunction } from './executeUserFunction';
import { Context } from 'koa';
import { Tables } from '../utils/database.types';
import { AxiosRequestConfig } from 'axios';

export async function handleRequest(
    ctx: Context,
    endpointData: Tables<'endpoints'>,
    requestHeaders: Record<string, string>,
    axiosConfig: AxiosRequestConfig
) {
    // Process request and get response
    const response = await processRequest(
        requestHeaders,
        endpointData,
        ctx,
        axiosConfig,
    );

    // Handle data mapping if enabled
    if (endpointData.data_mapping_enabled) {
        return {
            status: response.status,
            body: await executeUserFunction(
                endpointData.data_mapping_function!,
                response.data,
            ),
            headers: response.headers,
        };
    }

    return {
        status: response.status,
        body: response.data,
        headers: response.headers,
    };
}
