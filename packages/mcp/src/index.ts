#!/usr/bin/env node
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";

const envSchema = z.object({
    USER_KEY: z.string().min(1),
    BASE_API_URL: z.string().url().default("https://eu.api200.co/api"),
    DEBUG: z.enum(["true", "false"]).optional().transform(val => val === "true")
});

const env = envSchema.safeParse({
    USER_KEY: process.env.USER_KEY,
    BASE_API_URL: process.env.BASE_API_URL,
    DEBUG: process.env.DEBUG
});

if (!env.success) {
    console.error("Environment configuration error:", env.error.format());
    process.exit(1);
}

const userKey = env.data.USER_KEY;
const baseApiUrl = env.data.BASE_API_URL;
const debug = env.data.DEBUG ?? false;
const baseUrl = baseApiUrl.replace(/\/api$/, "/");

function log(...args: any[]) {
    if (debug) {
        const msg = `[DEBUG ${new Date().toISOString()}] ${args.join(" ")}\n`;
        process.stderr.write(msg);
    }
}

const getFullUrlWithParams = (service: any, endpoint: any, params: any): string => {
    const serviceName = service.name;
    let endpointPath = endpoint.name;

    if (endpoint.schema && endpoint.schema.parameters) {
        endpoint.schema.parameters.forEach((param: any) => {
            if (param.in === 'path' && params[param.name]) {
                endpointPath = endpointPath.replace(`{${param.name}}`, params[param.name]);
            }
        });
    }

    const fullUrl = `${baseApiUrl}/${serviceName}${endpointPath}`;

    const queryParams: string[] = [];
    if (endpoint.schema && endpoint.schema.parameters) {
        endpoint.schema.parameters.forEach((param: any) => {
            if (param.in === 'query' && params[param.name] !== undefined) {
                queryParams.push(`${param.name}=${encodeURIComponent(params[param.name])}`);
            }
        });
    }

    return queryParams.length > 0 ? `${fullUrl}?${queryParams.join('&')}` : fullUrl;
};

const extractRequestBodySchema = (endpoint: any): any => {
    if (!endpoint.schema || !endpoint.schema.requestBody || !endpoint.schema.requestBody.content) {
        return null;
    }

    const jsonContent = endpoint.schema.requestBody.content['application/json'];
    if (jsonContent && jsonContent.schema) {
        return jsonContent.schema;
    }

    const contentTypes = Object.keys(endpoint.schema.requestBody.content);
    if (contentTypes.length > 0) {
        const firstContentType = contentTypes[0];
        return endpoint.schema.requestBody.content[firstContentType].schema;
    }

    return null;
};

const convertOpenApiSchemaToZod = (schema: any): any => {
    if (!schema) return null;

    if (schema.type === 'array' && schema.items) {
        if (schema.items.$ref) {
            return z.array(z.object({}).passthrough());
        } else {
            return z.array(convertOpenApiSchemaToZod(schema.items));
        }
    }

    if (schema.type === 'object' || (!schema.type && schema.properties)) {
        const shape: Record<string, any> = {};

        if (schema.properties) {
            Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
                let zodType;

                switch (propSchema.type) {
                    case 'string':
                        zodType = z.string();
                        break;
                    case 'integer':
                    case 'number':
                        zodType = z.number();
                        break;
                    case 'boolean':
                        zodType = z.boolean();
                        break;
                    case 'array':
                        zodType = z.array(z.any());
                        break;
                    case 'object':
                        zodType = z.object({}).passthrough();
                        break;
                    default:
                        zodType = z.any();
                }

                if (schema.required && schema.required.includes(propName)) {
                    shape[propName] = zodType;
                } else {
                    shape[propName] = zodType.optional();
                }
            });
        }

        return z.object(shape).passthrough();
    }

    return z.any();
};

const main = async () => {

    const server = new McpServer({
        name: "API200 Client",
        version: "1.0.0"
    });

    try {
        const response = await fetch(`${baseUrl}/user/mcp-services`, {
            headers: {
                "x-api-key": userKey
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch MCP services: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        log(`Loaded ${data.length} services`);

        data.forEach((service: any) => {
            service.endpoints.forEach((endpoint: any) => {
                const paramSchema: Record<string, any> = {};

                if (endpoint.schema && endpoint.schema.parameters) {
                    endpoint.schema.parameters.forEach((param: any) => {
                        let zodType;
                        switch (param.type) {
                            case 'integer':
                                zodType = z.number().int();
                                break;
                            case 'number':
                                zodType = z.number();
                                break;
                            case 'string':
                                zodType = z.string();
                                break;
                            case 'boolean':
                                zodType = z.boolean();
                                break;
                            default:
                                zodType = z.string();
                        }

                        if (!param.required) {
                            zodType = zodType.optional();
                        }

                        if (param.description) {
                            zodType = zodType.describe(param.description);
                        }

                        paramSchema[param.name] = zodType;
                    });
                }

                if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase())) {
                    const bodySchema = extractRequestBodySchema(endpoint);
                    if (bodySchema) {
                        const zodBodySchema = convertOpenApiSchemaToZod(bodySchema);
                        paramSchema['requestBody'] = zodBodySchema || z.any().optional().describe('Request body payload');
                    } else {
                        paramSchema['requestBody'] = z.any().optional().describe('Request body payload');
                    }
                }

                // Updated code to include the HTTP method in the tool name
                const method = endpoint.method.toLowerCase();
                let toolName = `${method}_${endpoint.name.replace(/^\//, '').replace(/\//g, '_')}`;
                toolName = toolName.replace(/{([^}]+)}/g, 'by_$1');

                server.tool(
                    toolName,
                    endpoint.description || `${endpoint.method} ${endpoint.name}`,
                    paramSchema,
                    async (params) => {
                        try {
                            const url = getFullUrlWithParams(service, endpoint, params);

                            const requestOptions: RequestInit = {
                                method: endpoint.method,
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json",
                                    "x-api-key": userKey
                                }
                            };

                            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase()) && params.requestBody) {
                                requestOptions.body = JSON.stringify(params.requestBody);
                            }

                            log(`Making ${endpoint.method} request to: ${url}`);
                            if (requestOptions.body) {
                                log(`With body: ${requestOptions.body}`);
                            }

                            const apiResponse = await fetch(url, requestOptions);
                            const data = await apiResponse.json();

                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(data, null, 2)
                                    }
                                ]
                            };
                        } catch (error) {
                            log(`Error calling ${endpoint.name}:`, error);
                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                                        isError: true
                                    }
                                ]
                            };
                        }
                    }
                );

                log(`Registered tool: ${toolName}`);
            });
        });

    } catch (error) {
        log("Error setting up MCP tools:", error);
        process.exit(1);
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
};

main().catch(err => {
    log("Fatal error:", err);
    process.exit(1);
});
