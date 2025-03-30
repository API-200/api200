
import { readFile } from 'fs/promises';
import path from 'path';

const getTemplate = async (templateName: string) => await readFile(path.join(__dirname, 'templates', `${templateName}.template.html`), 'utf8');

export const getIncidentTemplate = async () => await getTemplate('incident');