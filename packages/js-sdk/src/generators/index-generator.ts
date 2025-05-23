// generators/index-generator.ts
import fs from 'fs-extra';
import path from 'path';
import { Service } from '../utils/types';
import { toCamelCase } from '../utils/string-utils';

export async function generateIndexFile(services: Service[], outputDir: string) {
    const serviceImports = services.map(service => {
        const serviceName = toCamelCase(service.name);
        return `import { ${serviceName} } from './${service.name}';`;
    }).join('\n');

    const serviceExports = services.map(service => {
        return `export { ${toCamelCase(service.name)} } from './${service.name}';`;
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
${serviceExports}

// Initialize the client - users should call this with their credentials
// createAPI200Client('https://eu.api200.co/api', 'your-api-key');

export const api200 = {
${apiObjectProperties}
};

export default api200;
`;

    await fs.writeFile(path.join(outputDir, 'index.ts'), indexContent);
}
