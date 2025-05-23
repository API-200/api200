// generators/client-generator.ts
import fs from 'fs-extra';
import path from 'path';

export async function generateApi200ClientFile(outputDir: string) {
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
