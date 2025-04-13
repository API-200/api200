import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";

const debug = true;
const baseApiUrl = "https://eu.api200.co/api";


function log(...args: any) {
    if (debug) {
        const msg = `[DEBUG ${new Date().toISOString()}] ${args.join(" ")}\n`;
        process.stderr.write(msg);
    }
}

// Helper function to construct the full URL with properly replaced parameters
const getFullUrlWithParams = (service: any, endpoint: any, params: any): string => {

    const serviceName = service.name;

    let endpointPath = endpoint.name;

    if (endpoint.schema && endpoint.schema.parameters) {
        endpoint.schema.parameters.forEach((param: any) => {
            if (param.in === 'path' && params[param.name]) {
                // Replace {paramName} with actual value
                endpointPath = endpointPath.replace(`{${param.name}}`, params[param.name]);
            }
        });
    }

    // Construct full URL
    const fullUrl = `${baseApiUrl}/${serviceName}${endpointPath}`;

    // Add query parameters if any
    const queryParams: string[] = [];
    if (endpoint.schema && endpoint.schema.parameters) {
        endpoint.schema.parameters.forEach((param: any) => {
            if (param.in === 'query' && params[param.name] !== undefined) {
                queryParams.push(`${param.name}=${encodeURIComponent(params[param.name])}`);
            }
        });
    }

    // Append query string if query parameters exist
    return queryParams.length > 0 ? `${fullUrl}?${queryParams.join('&')}` : fullUrl;
};

const main = async () => {
    const server = new McpServer({
        name: "API200 Client",
        version: "1.0.0"
    });

    try {
        const userKey = "022fad02fed409a185c42c4416cea7c0";

        const response = await fetch('http://localhost:8080/user/mcp-services', {
            headers: {
                "x-api-key": userKey
            }
        });
        const data = await response.json();

        data.forEach((service: any) => {

            service.endpoints.forEach((endpoint: any) => {

                // Create Zod schema dynamically based on endpoint parameters
                const paramSchema: Record<string, any> = {};

                if (endpoint.schema && endpoint.schema.parameters) {
                    endpoint.schema.parameters.forEach((param: any) => {
                        // Determine the Zod type based on the parameter type
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

                        // Make it optional if not required
                        if (!param.required) {
                            zodType = zodType.optional();
                        }

                        // Add description if available
                        if (param.description) {
                            zodType = zodType.describe(param.description);
                        }

                        paramSchema[param.name] = zodType;
                    });
                }

                // Create a formatted toolName from the endpoint name
                // Remove leading slash and replace remaining slashes with underscores
                let toolName = endpoint.name.replace(/^\//, '').replace(/\//g, '_');
                // Replace curly braces notation with "by" prefix
                toolName = toolName.replace(/{([^}]+)}/g, 'by_$1');

                // Register the tool with the server
                server.tool(
                    toolName,  // Tool name
                    endpoint.description || `${endpoint.method} ${endpoint.name}`,  // Description
                    paramSchema,  // Zod schema
                    async (params) => {
                        try {
                            // Get the properly constructed URL, passing service object to the helper function
                            const url = getFullUrlWithParams(service, endpoint, params);

                            log(`Making ${endpoint.method} request to: ${url}`);

                            // Make the actual API call
                            const apiResponse = await fetch(url, {
                                method: endpoint.method,
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json",
                                    "x-api-key": userKey
                                }
                            });

                            const data = await apiResponse.json();

                            // Return formatted response
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
                                        text: `Error: ${error instanceof Error ? error.message : String(error)}`
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
    }

    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
};

main();
