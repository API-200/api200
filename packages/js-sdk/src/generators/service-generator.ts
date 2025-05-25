// generators/service-generator.ts
import fs from 'fs-extra';
import path from 'path';
import { Service } from '../utils/types';
import { toCamelCase, toPascalCase, generateMethodName } from '../utils/string-utils';

export async function generateServiceFile(service: Service, outputDir: string) {
    const serviceName = toCamelCase(service.name);
    const methods: string[] = [];

    service.endpoints.forEach((endpoint) => {
        const methodName = generateMethodName(endpoint.method, endpoint.name);
        const hasParams =
            (endpoint.schema?.parameters?.length ?? 0) > 0 ||
            ['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase());
        const paramsType = hasParams ? `${toPascalCase(methodName)}Params` : '{}';

        methods.push(`
    ${methodName}: {
      async ${endpoint.method.toLowerCase()}(params${
            hasParams ? `: ${paramsType}` : '?'
        } = {} as ${paramsType}) {
        return makeRequest(config, '${service.name}', '${endpoint.name}', '${endpoint.method}', params);
      }
    }`);
    });

    const importTypes = service.endpoints
        .map((e) => {
            const methodName = generateMethodName(e.method, e.name);
            const hasParams =
                (e.schema?.parameters?.length ?? 0) > 0 ||
                ['POST', 'PUT', 'PATCH'].includes(e.method.toUpperCase());
            return hasParams ? `${toPascalCase(methodName)}Params` : '';
        })
        .filter(Boolean);

    const serviceContent = `import {
  ${importTypes.length > 0 ? importTypes.join(', ') + ', ' : ''}API200Config
} from './types';
import { makeRequest } from './api200';

export function create${toPascalCase(service.name)}Service(config: API200Config) {
  return {${methods.join(',')}
  };
}
`;

    await fs.writeFile(
        path.join(outputDir, `${service.name}.ts`),
        serviceContent.trimStart()
    );
}
