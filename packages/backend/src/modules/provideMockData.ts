export function provideMockData(endpointData: any) {
    if (endpointData.mock_enabled) {
        return {
            status: endpointData.mock_status_code!,
            body: endpointData.mock_response,
        };
    }
    return null;
}
