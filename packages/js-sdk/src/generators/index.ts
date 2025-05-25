// generators/index.ts
import fs from 'fs-extra';
import { Service } from '../utils/types';
import { generateTypesFile } from './type-generator';
import { generateServiceFile } from './service-generator';
import { generateApi200ClientFile } from './client-generator';
import { generateIndexFile } from './index-generator';

export async function generateSDK(userKey: string, baseApiUrl: string, outputDir: string) {
    console.log('🚀 Generating API200 SDK...');

    const baseUrl = baseApiUrl.replace(/\/api$/, "/");

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

    await fs.ensureDir(outputDir);

    await generateTypesFile(services, outputDir);
    await generateApi200ClientFile(services, outputDir);

    for (const service of services) {
        await generateServiceFile(service, outputDir);
    }

    await generateIndexFile(services, outputDir, userKey);

    console.log('✅ SDK generated successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('\n📖 Usage example:');
    console.log('```typescript');
    console.log(`import api200 from '${outputDir.startsWith('./src') ? outputDir.replace('./src/', './') : outputDir}';`);
    console.log('');
    console.log('const { data, error } = await api200.users.getUserById.get({ id: "123" });');
    console.log('if (error) {');
    console.log('  console.error(error.message);');
    console.log('} else {');
    console.log('  console.log(data);');
    console.log('}');
    console.log('```');
}
