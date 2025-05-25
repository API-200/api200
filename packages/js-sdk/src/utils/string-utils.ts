// utils/string-utils.ts
export function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + toCamelCase(str).slice(1);
}

export function generateMethodName(method: string, name: string): string {
    return `${method.toLowerCase()}_${name.replace(/^\//, '').replace(/\//g, '_')}`.replace(/{([^}]+)}/g, 'by_$1');
}
