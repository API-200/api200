function extractRouteParams(path: string) {
    const paramRegex = /\{([^}]+)\}/g;
    const params = [];
    let match;
    while ((match = paramRegex.exec(path)) !== null) {
        params.push(match[1]);
    }
    return params;
}

export default function haveSameRouteParams(endpoint1: string, endpoint2: string) {
    const params1 = extractRouteParams(endpoint1);
    const params2 = extractRouteParams(endpoint2);

    if (params1.length !== params2.length) {
        return false;
    }

    for (let i = 0; i < params1.length; i++) {
        if (params1[i] !== params2[i]) {
            return false;
        }
    }

    return true;
}