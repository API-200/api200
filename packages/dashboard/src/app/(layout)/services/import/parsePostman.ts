import {Tables} from "@/utils/supabase/database.types";

interface PostmanCollection {
    info: {
        _postman_id: string;
        name: string;
        description?: string;
        schema: string;
    };
    item: PostmanItem[];
    auth?: PostmanAuth;
    variable?: PostmanVariable[];
}

interface PostmanAuth {
    type: string;
    apikey?: PostmanAuthDetail[];
    bearer?: PostmanAuthDetail[];
    basic?: PostmanAuthDetail[];
    oauth2?: PostmanAuthDetail[];
}

interface PostmanAuthDetail {
    key: string;
    value: string;
    type: string;
}

interface PostmanVariable {
    key: string;
    value: string;
    type: string;
}

interface PostmanItem {
    name: string;
    item?: PostmanItem[];
    request?: PostmanRequest;
    auth?: PostmanAuth;
}

interface PostmanRequest {
    method: string;
    header: PostmanHeader[];
    url: PostmanUrl;
    description?: string;
    auth?: PostmanAuth;
    body?: PostmanBody;
}

interface PostmanHeader {
    key: string;
    value: string;
    type: string;
}

interface PostmanUrl {
    raw: string;
    protocol?: string;
    host?: string[];
    path?: string[];
    query?: PostmanQuery[];
    variable?: PostmanVariable[];
}

interface PostmanQuery {
    key: string;
    value: string;
}

interface PostmanBody {
    mode: string;
    raw?: string;
    formdata?: PostmanFormData[];
    urlencoded?: PostmanUrlEncoded[];
}

interface PostmanFormData {
    key: string;
    value: string;
    type: string;
}

interface PostmanUrlEncoded {
    key: string;
    value: string;
    type: string;
}

export interface ParsedPostmanResult {
    service: Tables<'services'>;
    endpoints: Tables<'endpoints'>[];
}

/**
 * Parse Postman Collection JSON and return service and endpoints objects
 */
export function parsePostman(postmanJson: string): ParsedPostmanResult {
    try {
        const postman: PostmanCollection = JSON.parse(postmanJson);

        // Create the service object
        const service = createServiceObject(postman);

        // Create the endpoints array
        const endpoints = createEndpointsArray(postman, service.base_url);

        return {service, endpoints};
    } catch (error) {
        console.error('Error parsing Postman collection:', error);
        throw error;
    }
}

/**
 * Create a service object based on Postman info
 */
function createServiceObject(postman: PostmanCollection): Tables<'services'> {
    // Determine base URL from variables or first request
    const baseUrl = determineBaseUrl(postman);

    // Determine authentication type
    const {authType, authEnabled, authConfig} = determineAuthSettings(postman);

    // Format service name to lowercase with dashes
    const formattedName = formatServiceName(postman.info.name);

    // Create and return service object
    return {
        name: formattedName,
        description: postman.info.description || null,
        base_url: baseUrl,
        auth_type: authType,
        auth_enabled: authEnabled,
        auth_config: authConfig,
        source: 'postman'
    } as Tables<'services'>;
}

/**
 * Determine the base URL from Postman collection
 */
function determineBaseUrl(postman: PostmanCollection): string {
    // Check for common base URL variable names
    const baseUrlVarNames = ['base_url', 'baseUrl', 'baseURL', 'BASE_URL', 'apiUrl', 'api_url', 'url', 'host'];
    let baseUrl = null;

    // First check collection variables
    if (postman.variable && postman.variable.length > 0) {
        for (const varName of baseUrlVarNames) {
            const baseUrlVar = postman.variable.find(v => v.key.toLowerCase() === varName.toLowerCase());
            if (baseUrlVar?.value) {
                // Remove trailing slashes
                return baseUrlVar.value.replace(/\/+$/, '');
            }
        }
    }

    // Then try to extract from the first request URL
    const firstRequest = findFirstRequest(postman.item);
    if (firstRequest?.request?.url) {
        const url = firstRequest.request.url;

        // Check if URL has variables
        if (url.variable && url.variable.length > 0) {
            for (const varName of baseUrlVarNames) {
                const urlVar = url.variable.find(v => v.key.toLowerCase() === varName.toLowerCase());
                if (urlVar?.value) {
                    return urlVar.value.replace(/\/+$/, '');
                }
            }
        }

        // Try to extract from host and protocol
        if (url.protocol && url.host) {
            return `${url.protocol}://${url.host.join('.')}`.replace(/\/+$/, '');
        }
        // Try to extract from raw URL
        else if (url.raw) {
            // First try to resolve any variables in the raw URL
            let resolvedRaw = url.raw;

            // Replace variables like {{base_url}} with their values if found
            const varMatches = resolvedRaw.match(/\{\{([^}]+)\}\}/g);
            if (varMatches && postman.variable) {
                for (const match of varMatches) {
                    const varName = match.replace(/\{\{|\}\}/g, '');
                    const variable = postman.variable.find(v => v.key === varName);
                    if (variable?.value) {
                        resolvedRaw = resolvedRaw.replace(match, variable.value);
                    }
                }
            }

            // Extract the base URL (protocol + host)
            const urlMatch = resolvedRaw.match(/^(https?:\/\/[^\/]+)/);
            if (urlMatch) {
                return urlMatch[1].replace(/\/+$/, '');
            }
        }
    }

    // Default fallback
    return 'https://api.example.com';
}

/**
 * Find the first request in the collection (recursive)
 */
function findFirstRequest(items: PostmanItem[]): PostmanItem | null {
    for (const item of items) {
        if (item.request) {
            return item;
        }
        if (item.item && item.item.length > 0) {
            const nestedRequest = findFirstRequest(item.item);
            if (nestedRequest) {
                return nestedRequest;
            }
        }
    }
    return null;
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
 * Determine authentication settings from Postman collection
 */
function determineAuthSettings(postman: PostmanCollection): {
    authType: 'api_key' | 'token' | null;
    authEnabled: boolean;
    authConfig: any | null;
} {
    // Initialize empty auth config object with the required structure
    const authConfig = {
        api_key: "",
        bearer_token: "",
        api_key_param: "",
        api_key_header: "",
        api_key_location: ""
    };

    // Check collection-level auth
    if (postman.auth) {
        if (postman.auth.type === 'apikey' && postman.auth.apikey) {
            const keyItem = postman.auth.apikey.find(item => item.key === 'key');
            const valueItem = postman.auth.apikey.find(item => item.key === 'value');

            if (keyItem && valueItem) {
                return {
                    authType: 'api_key',
                    authEnabled: true,
                    authConfig: {
                        ...authConfig,
                        api_key_header: keyItem.value,
                        api_key: valueItem.value,
                        api_key_location: 'header'
                    }
                };
            }
        }

        if (postman.auth.type === 'bearer' && postman.auth.bearer) {
            const tokenItem = postman.auth.bearer.find(item => item.key === 'token');
            if (tokenItem) {
                return {
                    authType: 'token',
                    authEnabled: true,
                    authConfig: {
                        ...authConfig,
                        bearer_token: tokenItem.value
                    }
                };
            }
        }

        // Handle OAuth as token
        if (postman.auth.type === 'oauth2') {
            return {
                authType: 'token',
                authEnabled: true,
                authConfig
            };
        }
    }

    // Check folder-level auth (first folder with auth)
    const folderWithAuth = findFolderWithAuth(postman.item);
    if (folderWithAuth && folderWithAuth.auth) {
        if (folderWithAuth.auth.type === 'apikey' && folderWithAuth.auth.apikey) {
            const keyItem = folderWithAuth.auth.apikey.find(item => item.key === 'key');
            const valueItem = folderWithAuth.auth.apikey.find(item => item.key === 'value');

            if (keyItem && valueItem) {
                return {
                    authType: 'api_key',
                    authEnabled: true,
                    authConfig: {
                        ...authConfig,
                        api_key_header: keyItem.value,
                        api_key: valueItem.value,
                        api_key_location: 'header'
                    }
                };
            }
        }

        if (folderWithAuth.auth.type === 'bearer' && folderWithAuth.auth.bearer) {
            const tokenItem = folderWithAuth.auth.bearer.find(item => item.key === 'token');
            if (tokenItem) {
                return {
                    authType: 'token',
                    authEnabled: true,
                    authConfig: {
                        ...authConfig,
                        bearer_token: tokenItem.value
                    }
                };
            }
        }
    }

    // Check request-level auth (first request with auth)
    const requestWithAuth = findRequestWithAuth(postman.item);
    if (requestWithAuth?.request?.auth) {
        const auth = requestWithAuth.request.auth;

        if (auth.type === 'apikey' && auth.apikey) {
            const keyItem = auth.apikey.find(item => item.key === 'key');
            const valueItem = auth.apikey.find(item => item.key === 'value');

            if (keyItem && valueItem) {
                return {
                    authType: 'api_key',
                    authEnabled: true,
                    authConfig: {
                        ...authConfig,
                        api_key_header: keyItem.value,
                        api_key: valueItem.value,
                        api_key_location: 'header'
                    }
                };
            }
        }

        if (auth.type === 'bearer' && auth.bearer) {
            const tokenItem = auth.bearer.find(item => item.key === 'token');
            if (tokenItem) {
                return {
                    authType: 'token',
                    authEnabled: true,
                    authConfig: {
                        ...authConfig,
                        bearer_token: tokenItem.value
                    }
                };
            }
        }
    }

    // Default: no auth
    return {
        authType: null,
        authEnabled: false,
        authConfig: null
    };
}

/**
 * Find the first folder with auth settings
 */
function findFolderWithAuth(items: PostmanItem[]): PostmanItem | null {
    for (const item of items) {
        if (item.auth) {
            return item;
        }
        if (item.item && item.item.length > 0) {
            const nestedFolder = findFolderWithAuth(item.item);
            if (nestedFolder) {
                return nestedFolder;
            }
        }
    }
    return null;
}

/**
 * Find the first request with auth settings (recursive)
 */
function findRequestWithAuth(items: PostmanItem[]): PostmanItem | null {
    for (const item of items) {
        if (item.request?.auth) {
            return item;
        }
        if (item.item && item.item.length > 0) {
            const nestedRequest = findRequestWithAuth(item.item);
            if (nestedRequest) {
                return nestedRequest;
            }
        }
    }
    return null;
}

/**
 * Create an array of endpoint objects from the Postman collection
 */
function createEndpointsArray(postman: PostmanCollection, baseUrl: string): Tables<'endpoints'>[] {
    const endpoints: Tables<'endpoints'>[] = [];

    // Process all request items recursively
    processItems(postman.item, endpoints, baseUrl);

    return endpoints;
}

/**
 * Process Postman items recursively and add endpoints
 */
function processItems(items: PostmanItem[], endpoints: Tables<'endpoints'>[], baseUrl: string, serviceId?: number, parentPath: string = ''): void {
    for (const item of items) {
        // If this is a folder, process its items recursively
        if (item.item && item.item.length > 0) {
            // Use the folder name as part of the path
            const folderPath = parentPath ? `${parentPath}/${formatPath(item.name)}` : formatPath(item.name);
            processItems(item.item, endpoints, baseUrl, serviceId, folderPath);
        }
        // If this is a request, add it as an endpoint
        else if (item.request) {
            const request = item.request;

            // Skip if no URL
            if (!request.url) {
                continue;
            }

            // Get method or default to GET
            const method = request.method ? request.method.toUpperCase() : 'GET';

            // Extract path from URL
            let path = '';

            if (request.url.path && request.url.path.length > 0) {
                // Join path segments
                path = '/' + request.url.path.join('/');
            } else if (request.url.raw) {
                try {
                    // Try to extract path from raw URL
                    // Replace any variable placeholders with a placeholder string
                    const sanitizedUrl = request.url.raw.replace(/\{\{.*?\}\}/g, 'placeholder');
                    // If the URL doesn't have a protocol, add one
                    const urlWithProtocol = sanitizedUrl.startsWith('http')
                        ? sanitizedUrl
                        : `https://${sanitizedUrl}`;

                    const urlObj = new URL(urlWithProtocol);
                    path = urlObj.pathname;
                } catch (error) {
                    // If URL parsing fails, try to extract path with regex
                    const pathMatch = request.url.raw.match(/https?:\/\/[^\/]+(\/[^?#]*)/);
                    if (pathMatch && pathMatch[1]) {
                        path = pathMatch[1];
                    } else {
                        // If we still can't extract, use the raw URL as the name
                        path = request.url.raw;
                    }
                }
            }

            // Skip if we couldn't determine a path
            if (!path) {
                continue;
            }

            // Add parent path if it exists
            if (parentPath) {
                // Make sure we don't duplicate path segments
                if (!path.startsWith('/api') && !parentPath.startsWith('/api')) {
                    path = `/api/${parentPath}${path}`;
                } else {
                    path = `/${parentPath}${path}`;
                }
            }

            // Format the path
            path = formatEndpointPath(path);

            // Ensure the path starts with a slash
            if (!path.startsWith('/')) {
                path = '/' + path;
            }

            // Create the full URL with base URL and path
            const full_url = `${baseUrl}${path}`;

            // Get the regex path
            const regex_path = '^' + path.replace(/{[^}]+}/g, '([^/]+)') + '$';

            // Get description
            const description = request.description || item.name || '';

            // Extract parameters from request
            const parameters = [];

            // Add query parameters if they exist
            if (request.url.query && request.url.query.length > 0) {
                for (const query of request.url.query) {
                    parameters.push({
                        name: query.key,
                        in: 'query',
                        required: false,
                        type: 'string',
                        description: ''
                    });
                }
            }

            // Add path parameters if they exist (extracted from the path)
            const pathParams = path.match(/{([^}]+)}/g);
            if (pathParams) {
                for (const param of pathParams) {
                    const paramName = param.replace(/[{}]/g, '');
                    parameters.push({
                        name: paramName,
                        in: 'path',
                        required: true,
                        type: 'string',
                        description: `Path parameter ${paramName}`
                    });
                }
            }

            // Add header parameters from request headers
            if (request.header && request.header.length > 0) {
                for (const header of request.header) {
                    parameters.push({
                        name: header.key,
                        in: 'header',
                        required: false,
                        type: 'string',
                        description: ''
                    });
                }
            }

            // Add body parameters if they exist
            if (request.body) {
                if (request.body.mode === 'raw' && request.body.raw) {
                    try {
                        const body = request.body.raw;
                        for (const [key, value] of Object.entries(body)) {
                            parameters.push({
                                name: key,
                                in: 'body',
                                required: false,
                                type: typeof value,
                                description: ''
                            });
                        }
                    } catch (e) {
                        parameters.push({
                            name: 'body',
                            in: 'body',
                            required: false,
                            type: 'string',
                            description: 'Raw request body'
                        });
                    }
                } else if (request.body.mode === 'formdata' && request.body.formdata) {
                    for (const formParam of request.body.formdata) {
                        parameters.push({
                            name: formParam.key,
                            in: 'formData',
                            required: false,
                            type: formParam.type || 'string',
                            description: ''
                        });
                    }
                } else if (request.body.mode === 'urlencoded' && request.body.urlencoded) {
                    for (const encodedParam of request.body.urlencoded) {
                        parameters.push({
                            name: encodedParam.key,
                            in: 'formData',
                            required: false,
                            type: 'string',
                            description: ''
                        });
                    }
                }
            }


            // Create default values for all the required fields in the endpoint schema
            const endpoint: Tables<'endpoints'> = {
                name: item.name || path,
                description: description,
                method: method,
                full_url: full_url,
                regex_path: regex_path,
                source: 'postman',
                schema: {
                    parameters: parameters,
                    responses: {
                        "200": {
                            description: "Successful operation"
                        }
                    }
                },
            } as unknown as Tables<'endpoints'>;

            endpoints.push(endpoint);
        }
    }
}

/**
 * Format path for naming purposes
 */
function formatPath(path: string): string {
    return path
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Format endpoint path, handling path parameters
 */
function formatEndpointPath(path: string): string {
    // Replace URL param placeholders like :id with {id}
    return path
        .replace(/:([a-zA-Z0-9_]+)/g, '{$1}')
        // Also normalize any path with {{variable}} to {variable}
        .replace(/\{\{([^}]+)\}\}/g, '{$1}');
}
