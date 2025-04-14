import { Tables } from "@/utils/supabase/database.types";
import { env } from "next-runtime-env";

export const generateSwaggerSpec = (services: Tables<'services'>[], endpoints: Tables<'endpoints'>[], title: string) => {
    const paths: any = {};
    const tags: any[] = [];

    // For collecting all component schemas from endpoints
    const allComponentSchemas: Record<string, any> = {};

    // Global API Key Security Scheme
    const securitySchemes = {
        api_key: {
            type: "apiKey",
            name: "x-api-key",
            in: "header"
        }
    };

    services.forEach(service => {
        tags.push({
            name: service.name,
            description: service.description
        });

        endpoints
            .filter(e => e.service_id === service.id)
            .forEach(endpoint => {
                const fullPath = `/${service.name}${endpoint.name}`;
                const method = endpoint.method.toLowerCase();

                // Parse the schema JSON if it exists
                let endpointSchema: any = {};
                let hasCustomSchema = false;

                if (endpoint.schema) {
                    try {
                        // If schema is a string, parse it; if it's already an object, use it directly
                        endpointSchema = typeof endpoint.schema === 'string'
                            ? JSON.parse(endpoint.schema)
                            : endpoint.schema;
                        hasCustomSchema = true;

                        // Extract component schemas if available
                        if (endpointSchema.components && endpointSchema.components.schemas) {
                            // Merge with all component schemas
                            Object.assign(allComponentSchemas, endpointSchema.components.schemas);
                        }
                    } catch (error) {
                        console.error(`Failed to parse schema for endpoint ${endpoint.name}:`, error);
                    }
                }

                // Determine parameters based on schema availability
                const parameters = hasCustomSchema && endpointSchema.parameters
                    ? endpointSchema.parameters
                    : hasCustomSchema
                        ? []
                        : [
                            {
                                name: "queryParams",
                                in: "query",
                                style: "form",
                                explode: true,
                                schema: {
                                    type: "object",
                                    additionalProperties: { type: "string" }
                                }
                            }
                        ];

                // Use custom responses if available in schema, otherwise use default
                const responses = hasCustomSchema && endpointSchema.responses
                    ? endpointSchema.responses
                    : { 200: { description: "Success" } };

                // Determine requestBody based on schema availability and method
                let requestBody;
                if (method !== 'get') {
                    if (hasCustomSchema && endpointSchema.requestBody) {
                        requestBody = endpointSchema.requestBody;
                    } else if (!hasCustomSchema) {
                        requestBody = {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true
                                    }
                                }
                            }
                        };
                    }
                }

                paths[fullPath] = paths[fullPath] || {};
                paths[fullPath][method] = {
                    tags: [service.name],
                    summary: endpoint.description || `${method.toUpperCase()} ${endpoint.name}`,
                    description: endpoint.description || `Will call ${endpoint.full_url}`,
                    parameters,
                    requestBody,
                    responses
                };
            });
    });

    // Build the complete OpenAPI specification
    const components = {
        schemas: Object.keys(allComponentSchemas).length > 0 ? allComponentSchemas : undefined,
        securitySchemes
    };

    return {
        openapi: "3.0.0",
        info: {
            title,
            version: "1.0.0",
            description: "This is a specification of your services and endpoints. Use your api key for authorization and test endpoints.",
        },
        servers: [{ url: `${env('NEXT_PUBLIC_BACKEND_URL')}/api` }],
        paths,
        tags,
        components,
        security: [{ api_key: [] }] // Applies to all operations
    };
};
