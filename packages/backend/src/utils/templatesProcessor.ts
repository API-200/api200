
export const prepareHtml = (template: string, data: Record<string, string>) => {
    return template.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
        return data[key] || match;
    });
}