#!/usr/bin/env node
import { Command } from 'commander';
import { generateSDK } from './generators';
import { envSchema } from './utils/schema';
import { determineOutputDirectory } from './utils/file-utils';

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

program.parse();
