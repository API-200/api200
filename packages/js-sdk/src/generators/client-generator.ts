// generators/client-generator.ts
import fs from 'fs-extra';
import path from 'path';
import { Service } from '../utils/types';
import { toCamelCase, toPascalCase } from '../utils/string-utils';

export async function generateApi200ClientFile(services: Service[], outputDir: string) {
    const serviceImports = services.map(service => {
        const serviceName = toCamelCase(service.name);
        return `import { create${toPascalCase(service.name)}Service } from './${service.name}';`;
    }).join('\n');

    const apiObjectProperties = services.map(service => {
        const serviceName = toCamelCase(service.name);
        return `    ${serviceName}: create${toPascalCase(service.name)}Service(config)`;
    }).join(',\n');

    const clientContent = `import { API200Config } from './types';
${serviceImports}


export interface API200Client {
${services.map(service => {
        const serviceName = toCamelCase(service.name);
        return `  ${serviceName}: ReturnType<typeof create${toPascalCase(service.name)}Service>;`;
    }).join('\n')}
}

export async function makeRequest(config: API200Config, serviceName: string, endpointPath: string, method: string, params: any = {}): Promise<{ data: any; error: any }> {
  try {
    let processedPath = endpointPath;
    const queryParams: string[] = [];
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (processedPath.includes(\`{\${key}}\`)) {
          processedPath = processedPath.replace(\`{\${key}}\`, params[key]);
        } else if (key !== 'requestBody') {
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

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data.error || \`HTTP \${response.status}: \${response.statusText}\`,
          status: response.status,
          details: data.details
        }
      };
    }

    return {
      data,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : String(error),
        status: 0
      }
    };
  }
}

export function createAPI200Client(userKey: string, baseUrl: string = 'https://eu.api200.co/api'): API200Client {
  const config: API200Config = { baseUrl, userKey };
  
  return {
${apiObjectProperties}
  };
}
`;

    await fs.writeFile(path.join(outputDir, 'api200.ts'), clientContent);
}
