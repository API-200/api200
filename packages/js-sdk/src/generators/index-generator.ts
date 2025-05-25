// generators/index-generator.ts
import fs from 'fs-extra';
import path from 'path';
import { Service } from '../utils/types';

export async function generateIndexFile(services: Service[], outputDir: string, userKey: string) {
    const indexContent = `import { createAPI200Client } from './api200';

// TODO: Move this to environment variables (process.env.API200_KEY)
const api200 = createAPI200Client('${userKey}', 'https://eu.api200.co/api');

export default api200;
export * from './types';
export { createAPI200Client } from './api200';
`;

    await fs.writeFile(path.join(outputDir, 'index.ts'), indexContent);
}
