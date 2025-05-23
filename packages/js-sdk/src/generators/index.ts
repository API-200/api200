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

    // Generate all files
    await generateTypesFile(services, outputDir);
    await generateApi200ClientFile(outputDir);

    // Generate service files
    for (const service of services) {
        await generateServiceFile(service, outputDir);
    }

    // Generate main index file
    await generateIndexFile(services, outputDir);

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
