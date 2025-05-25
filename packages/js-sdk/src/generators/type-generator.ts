// generators/type-generator.ts
import fs from 'fs-extra';
import path from 'path';
import { Service } from '../utils/types';
import { toPascalCase, generateMethodName } from '../utils/string-utils.js';

export function generateTypeFromSchema(schema: any): string {
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

export async function generateTypesFile(services: Service[], outputDir: string) {
    const typeDefinitions: string[] = [];

    services.forEach(service => {
        service.endpoints.forEach(endpoint => {
            const methodName = generateMethodName(endpoint.method, endpoint.name);

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

            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase())) {
                if (endpoint.schema?.requestBody?.content) {
                    const jsonContent = endpoint.schema.requestBody.content['application/json'];
                    if (jsonContent?.schema) {
                        const requestBodyType = generateTypeFromSchema(jsonContent.schema);
                        paramTypes.push(`  requestBody?: ${requestBodyType};`);
                    } else {
                        paramTypes.push(`  requestBody?: any;`);
                    }
                } else {
                    paramTypes.push(`  requestBody?: any;`);
                }
            }

            if (paramTypes.length > 0) {
                typeDefinitions.push(`export interface ${toPascalCase(methodName)}Params {\n${paramTypes.join('\n')}\n}`);
            }
        });
    });

    const typesContent = `${typeDefinitions.join('\n\n')}

export interface API200Config {
    baseUrl: string;
    userKey: string;
}

export interface API200Response<T = any> {
    data: T | null;
    error: API200Error | null;
}

export interface API200Error {
    message: string;
    status?: number;
    details?: any;
}
`;

    await fs.writeFile(path.join(outputDir, 'types.ts'), typesContent);
}
