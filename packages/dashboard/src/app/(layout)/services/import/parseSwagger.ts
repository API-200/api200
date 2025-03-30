import {Tables} from "@/utils/supabase/database.types";

interface SwaggerSchema {
    swagger: string;
    info: {
        title: string;
        description?: string;
        version: string;
    };
    host: string;
    basePath: string;
    schemes: string[];
    paths: {
        [path: string]: {
            [method: string]: {
                tags: string[];
                summary: string;
                description?: string;
                operationId: string;
                parameters?: any[];
                responses: any;
            }
        }
    };
    securityDefinitions?: Record<string, any>;
}

export interface ParsedSwaggerResult {
    service: Tables<'services'>;
    endpoints: Tables<'endpoints'>[];
}

/**
 * Parse Swagger JSON and return service and endpoints objects
 */
export function parseSwagger(swaggerJson: string): ParsedSwaggerResult {
    try {

        const swagger: SwaggerSchema = JSON.parse(swaggerJson);

        // Create the service object
        const service = createServiceObject(swagger);

        // Create the endpoints array
        const endpoints = createEndpointsArray(swagger, service.base_url);

        return {service, endpoints};
    } catch (error) {
        console.error('Error parsing Swagger schema:', error);
        throw error;
    }
}

/**
 * Create a service object based on Swagger info
 */
function createServiceObject(swagger: SwaggerSchema): Tables<'services'> {
    // Determine the base URL from host, basePath, and schemes
    const scheme = getPreferredScheme(swagger.schemes);
    const baseUrl = `${scheme}://${swagger.host}${swagger.basePath}`;

    // Determine authentication type
    const {authType, authEnabled, authConfig} = determineAuthSettings(swagger);

    // Format service name to lowercase with dashes
    const formattedName = formatServiceName(swagger.info.title);

    // Create and return service object
    return {
        name: formattedName,
        description: swagger.info.description || null,
        base_url: baseUrl,
        auth_type: authType,
        auth_enabled: authEnabled,
        auth_config: authConfig,
        source: 'openapi'
    } as Tables<'services'>;
}

/**
 * Format service name to lowercase with dashes
 */
function formatServiceName(name: string): string {
    // Convert to lowercase, replace spaces and non-alphanumeric chars with dashes
    return name
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[^a-z0-9-]/g, '-') // Replace other non-alphanumeric chars with dashes
        .replace(/-+/g, '-') // Replace multiple consecutive dashes with a single dash
        .replace(/^-|-$/g, ''); // Remove leading and trailing dashes
}

/**
 * Get the preferred scheme (https > http)
 */
function getPreferredScheme(schemes?: string[]): string {
    if (!schemes || schemes.length === 0) {
        return 'https';
    }

    return schemes.includes('https') ? 'https' : schemes[0];
}

/**
 * Determine authentication settings from Swagger security definitions
 */
function determineAuthSettings(swagger: SwaggerSchema): {
    authType: 'api_key' | 'token' | null;
    authEnabled: boolean;
    authConfig: any | null;
} {
    if (!swagger.securityDefinitions) {
        return {
            authType: null,
            authEnabled: false,
            authConfig: null
        };
    }

    // Initialize empty auth config object with the required structure
    const authConfig = {
        api_key: "",
        bearer_token: "",
        api_key_param: "",
        api_key_header: "",
        api_key_location: ""
    };

    // Check for API Key authentication
    const apiKeyDef = Object.entries(swagger.securityDefinitions)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .find(([_, def]) => def.type === 'apiKey');

    if (apiKeyDef) {
        const [name, def] = apiKeyDef;
        return {
            authType: 'api_key',
            authEnabled: true,
            authConfig: {
                ...authConfig,
                api_key_param: name,
                api_key_header: def.name || '',
                api_key_location: def.in || ''
            }
        };
    }

    // Check for OAuth or other token-based authentication
    const tokenDef = Object.entries(swagger.securityDefinitions)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .find(([_, def]) => def.type === 'oauth2' || def.type === 'http');

    if (tokenDef) {
        if (tokenDef[1].type !== 'oauth2' && tokenDef[1].scheme !== 'bearer') {
            console.warn(`Auth type '${tokenDef[1].type}' detected but not fully supported. Using 'token' type.`);
        }

        return {
            authType: 'token',
            authEnabled: true,
            authConfig
        };
    }

    // Handle unsupported auth types
    const unsupportedAuth = Object.entries(swagger.securityDefinitions)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .find(([_, def]) => def.type !== 'apiKey' && def.type !== 'oauth2');

    if (unsupportedAuth) {
        console.warn(`Unsupported auth type '${unsupportedAuth[1].type}' detected. Auth will be disabled.`);
    }

    return {
        authType: null,
        authEnabled: false,
        authConfig: null
    };
}

/**
 * Create an array of endpoint objects from the Swagger schema
 */
function createEndpointsArray(swagger: SwaggerSchema, baseUrl: string): Tables<'endpoints'>[] {
    const endpoints: Tables<'endpoints'>[] = [];

    // Process each path and method combination
    for (const [path, pathItem] of Object.entries(swagger.paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
            // Skip if not a valid HTTP method
            if (!isValidHttpMethod(method)) {
                continue;
            }

            // Format the name with leading slash
            const name = path.startsWith('/') ? path : `/${path}`;

            // Create the full URL with base URL and path
            const full_url = `${baseUrl}${path}`;

            // Get the regex path from the name
            const regex_path = '^' + name.replace(/{[^}]+}/g, '([^/]+)') + '$'

            // Get description from the operation
            const description = operation.description || operation.summary || '';

            // Create endpoint object
            const endpoint: Partial<Tables<'endpoints'>> = {
                name,
                method: method.toUpperCase(),
                full_url,
                regex_path,
                description,
                source: 'openapi',
                schema: {
                    parameters: operation.parameters || [],
                    responses: operation.responses,
                },
            };

            endpoints.push(endpoint as Tables<'endpoints'>);
        }
    }

    return endpoints;
}

/**
 * Check if a string is a valid HTTP method
 */
function isValidHttpMethod(method: string): boolean {
    return ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']
        .includes(method.toLowerCase());
}
