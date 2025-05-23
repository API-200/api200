#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

const envSchema = z.object({
    token: z.string().min(1),
    baseUrl: z.string().url().default("https://eu.api200.co/api"),
    output: z.string().optional()
});

interface ServiceEndpoint {
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

interface Service {
    name: string;
    description?: string;
    endpoints: ServiceEndpoint[];
}

const program = new Command();

program
    .name('api200-generate-sdk')
    .description('Generate TypeScript SDK for API200 services')
    .requiredOption('-t, --token <token>', 'API200 user token')
    .option('-u, --base-url <url>', 'Base API URL', 'https://eu.api200.co/api')
    .option('-o, --output <path>', 'Output directory')
    .action(async (options) => {
        try {
            const config = envSchema.parse({
                token: options.token,
                baseUrl: options.baseUrl,
                output: options.output
            });

            // Determine output directory
            const outputDir = determineOutputDirectory(config.output);

            await generateSDK(config.token, config.baseUrl, outputDir);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });

function determineOutputDirectory(providedOutput?: string): string {
    if (providedOutput) {
        return providedOutput;
    }

    const currentDir = process.cwd();
    const srcExists = fs.existsSync(path.join(currentDir, 'src'));

    if (srcExists) {
        return './src/lib/api200';
    } else {
        return './lib/api200';
    }
}

async function generateSDK(userKey: string, baseApiUrl: string, outputDir: string) {
    console.log('🚀 Generating API200 SDK...');

    const baseUrl = baseApiUrl.replace(/\/api$/, "/");

    // Fetch services data
    const response = await fetch(`${baseUrl}/user/mcp-services`, {
        headers: {
            "x-api-key": userKey
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
    }

    const services: Service[] = await response.json();
    console.log(`📡 Found ${services.length} services`);

    // Create output directory
    await fs.ensureDir(outputDir);

    // Generate types file
    await generateTypesFile(services, outputDir);

    // Generate api200 client file
    await generateApi200ClientFile(outputDir);

    // Generate service files
    const serviceExports: string[] = [];
    for (const service of services) {
        const serviceName = toCamelCase(service.name);
        await generateServiceFile(service, outputDir);
        serviceExports.push(`export { ${serviceName} } from './${service.name}';`);
    }

    // Generate main index file
    await generateIndexFile(services, serviceExports, outputDir);

    console.log('✅ SDK generated successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('\n📖 Usage example:');
    console.log('```typescript');
    console.log(`import { createAPI200Client, api200 } from '${outputDir.startsWith('./src') ? outputDir.replace('./src/', './') : outputDir}';`);
    console.log('');
    console.log('// Initialize the client with your credentials');
    console.log("createAPI200Client('https://eu.api200.co/api', 'your-api-key');");
    console.log('');
    console.log('// Use the API');
    console.log('const result = await api200.users.getUserById.get({ id: "123" });');
    console.log('```');
}

function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + toCamelCase(str).slice(1);
}

function generateTypeFromSchema(schema: any): string {
    if (!schema) return 'any';

    if (schema.type === 'array' && schema.items) {
        return `Array<${generateTypeFromSchema(schema.items)}>`;
    }

    if (schema.type === 'object' || (!schema.type && schema.properties)) {
        const props: string[] = [];
        if (schema.properties) {
            Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
                const isRequired = schema.required?.includes(propName);
                const propType = generateTypeFromSchema(propSchema);
                props.push(`  ${propName}${isRequired ? '' : '?'}: ${propType};`);
            });
        }
        return `{\n${props.join('\n')}\n}`;
    }

    switch (schema.type) {
        case 'string': return 'string';
        case 'integer':
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        default: return 'any';
    }
}

async function generateTypesFile(services: Service[], outputDir: string) {
    const typeDefinitions: string[] = [];

    services.forEach(service => {
        service.endpoints.forEach(endpoint => {
            const methodName = `${endpoint.method.toLowerCase()}_${endpoint.name.replace(/^\//, '').replace(/\//g, '_')}`.replace(/{([^}]+)}/g, 'by_$1');

            // Parameters interface
            const paramTypes: string[] = [];
            if (endpoint.schema?.parameters) {
                endpoint.schema.parameters.forEach(param => {
                    const isRequired = param.required !== false;
                    let paramType = 'string';
                    switch (param.type) {
                        case 'integer':
                        case 'number':
                            paramType = 'number';
                            break;
                        case 'boolean':
                            paramType = 'boolean';
                            break;
                    }
                    paramTypes.push(`  ${param.name}${isRequired ? '' : '?'}: ${paramType};`);
                });
            }

            // Request body type
            let requestBodyType = '';
            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase())) {
                if (endpoint.schema?.requestBody?.content) {
                    const jsonContent = endpoint.schema.requestBody.content['application/json'];
                    if (jsonContent?.schema) {
                        requestBodyType = generateTypeFromSchema(jsonContent.schema);
                    } else {
                        requestBodyType = 'any';
                    }
                    paramTypes.push(`  requestBody?: ${requestBodyType};`);
                } else {
                    paramTypes.push(`  requestBody?: any;`);
                }
            }

            if (paramTypes.length > 0) {
                typeDefinitions.push(`export interface ${toPascalCase(methodName)}Params {\n${paramTypes.join('\n')}\n}`);
            }
        });
    });

    const typesContent = `// Auto-generated types for API200 SDK
${typeDefinitions.join('\n\n')}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

export interface ApiError {
    message: string;
    status?: number;
    statusText?: string;
}
`;

    await fs.writeFile(path.join(outputDir, 'types.ts'), typesContent);
}

async function generateServiceFile(service: Service, outputDir: string) {
    const serviceName = toCamelCase(service.name);
    const methods: string[] = [];

    service.endpoints.forEach(endpoint => {
        const methodName = `${endpoint.method.toLowerCase()}_${endpoint.name.replace(/^\//, '').replace(/\//g, '_')}`.replace(/{([^}]+)}/g, 'by_$1');
        const hasParams = endpoint.schema?.parameters?.length! > 0 || ['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase());
        const paramsType = hasParams ? `${toPascalCase(methodName)}Params` : '{}';

        methods.push(`
  ${methodName}: {
    async ${endpoint.method.toLowerCase()}(params${hasParams ? `: ${paramsType}` : '?'}: ${paramsType} = {} as ${paramsType}): Promise<ApiResponse> {
      return makeRequest('${service.name}', '${endpoint.name}', '${endpoint.method}', params);
    }
  }`);
    });

    const importTypes = service.endpoints
        .map(e => {
            const methodName = `${e.method.toLowerCase()}_${e.name.replace(/^\//, '').replace(/\//g, '_')}`.replace(/{([^}]+)}/g, 'by_$1');
            const hasParams = e.schema?.parameters?.length! > 0 || ['POST', 'PUT', 'PATCH'].includes(e.method.toUpperCase());
            return hasParams ? `${toPascalCase(methodName)}Params` : '';
        })
        .filter(Boolean);

    const serviceContent = `// Auto-generated service: ${service.name}
import { ApiResponse, ApiError${importTypes.length > 0 ? ', ' + importTypes.join(', ') : ''} } from './types';
import { makeRequest } from './api200';

export const ${serviceName} = {${methods.join(',')}
};
`;

    await fs.writeFile(path.join(outputDir, `${service.name}.ts`), serviceContent);
}

async function generateApi200ClientFile(outputDir: string) {
    const clientContent = `// Auto-generated API200 client
import { ApiResponse, ApiError } from './types';

let config: { baseUrl: string; userKey: string } | null = null;

export function createAPI200Client(baseUrl: string, userKey: string) {
  config = { baseUrl, userKey };
}

export async function makeRequest(serviceName: string, endpointPath: string, method: string, params: any = {}): Promise<ApiResponse> {
  if (!config) {
    throw new Error('API200 client not initialized. Call createAPI200Client(baseUrl, userKey) first.');
  }

  try {
    // Handle path parameters
    let processedPath = endpointPath;
    const queryParams: string[] = [];
    
    if (params) {
      // Replace path parameters
      Object.keys(params).forEach(key => {
        if (processedPath.includes(\`{\${key}}\`)) {
          processedPath = processedPath.replace(\`{\${key}}\`, params[key]);
        } else if (key !== 'requestBody') {
          // Add as query parameter
          queryParams.push(\`\${key}=\${encodeURIComponent(params[key])}\`);
        }
      });
    }

    const fullUrl = \`\${config.baseUrl}/\${serviceName}\${processedPath}\${queryParams.length ? '?' + queryParams.join('&') : ''}\`;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': config.userKey
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && params.requestBody) {
      requestOptions.body = JSON.stringify(params.requestBody);
    }

    const response = await fetch(fullUrl, requestOptions);
    const data = await response.json();

    return {
      data,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    throw {
      message: error instanceof Error ? error.message : String(error),
      status: 0,
      statusText: 'Network Error'
    } as ApiError;
  }
}
`;

    await fs.writeFile(path.join(outputDir, 'api200.ts'), clientContent);
}

async function generateIndexFile(services: Service[], serviceExports: string[], outputDir: string) {
    const serviceImports = services.map(service => {
        const serviceName = toCamelCase(service.name);
        return `import { ${serviceName} } from './${service.name}';`;
    }).join('\n');

    const apiObjectProperties = services.map(service => {
        const serviceName = toCamelCase(service.name);
        return `  ${serviceName}`;
    }).join(',\n');

    const indexContent = `// Auto-generated API200 SDK
import { createAPI200Client } from './api200';
${serviceImports}

export * from './types';
export { createAPI200Client } from './api200';
${serviceExports.join('\n')}

// Initialize the client - users should call this with their credentials
// createAPI200Client('https://eu.api200.co/api', 'your-api-key');

export const api200 = {
${apiObjectProperties}
};

export default api200;
`;

    await fs.writeFile(path.join(outputDir, 'index.ts'), indexContent);
}

program.parse();
