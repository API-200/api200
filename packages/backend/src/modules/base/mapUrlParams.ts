import { Tables } from '../../utils/database.types';

export const getFullUrlWithParams = (
    endpoint: Tables<'endpoints'>,
    endpointName: string,
): string => {
    // Ensure endpointName starts with a forward slash
    const normalizedEndpointName = endpointName.startsWith('/') ? endpointName : `/${endpointName}`;

    if (endpoint.regex_path === `^${endpoint.name}$`) {
        return endpoint.full_url;
    }

    const regex = new RegExp(endpoint.regex_path!);
    const matches = normalizedEndpointName.match(regex);

    if (!matches) {
        //TODO return instead of throwing so it wont be catched in global error handler
        throw new Error(`API200 Error: Path parameters don't match provided`);
    }

    // Get the parameter names from the full_url
    const paramNames = endpoint.full_url.match(/\{([^}]+)\}/g) || [];

    // Start with the full URL
    let finalUrl = endpoint.full_url;

    // Replace each parameter with its corresponding value
    paramNames.forEach((param, index) => {
        // matches[0] is the full match, so we start from index 1 for capture groups
        const value = matches[index + 1];
        if (value) {
            finalUrl = finalUrl.replace(param, value);
        }
    });

    return finalUrl;
};
