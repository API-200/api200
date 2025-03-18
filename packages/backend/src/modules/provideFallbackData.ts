export interface FallbackData {
    enabled: boolean;
    code: number;
    response: any;
}

export function extractFallbackData(endpointData: any) {
    return {
        enabled: endpointData.fallback_response_enabled,
        code: endpointData.fallback_status_code,
        response: endpointData.fallback_response,
    };
}
