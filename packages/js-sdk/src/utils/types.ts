export interface ServiceEndpoint {
    name: string;
    method: string;
    description?: string;
    schema?: {
        parameters?: Array<{
            name: string;
            type: string;
            in: 'path' | 'query' | 'header' | 'body';
            required?: boolean;
            description?: string;
        }>;
        requestBody?: {
            content: {
                [contentType: string]: {
                    schema: any;
                };
            };
        };
    };
}

export interface Service {
    name: string;
    description?: string;
    endpoints: ServiceEndpoint[];
}
