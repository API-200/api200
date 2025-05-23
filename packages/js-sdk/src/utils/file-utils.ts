// utils/file-utils.ts
import fs from 'fs-extra';
import path from 'path';

export function determineOutputDirectory(providedOutput?: string): string {
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
