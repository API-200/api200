export const generateRouteHash = (metadata: {
    serviceName: string;
    endpointName: string;
    userId: string;
}) => `route:${metadata.userId}:${metadata.serviceName}:${metadata.endpointName}`;