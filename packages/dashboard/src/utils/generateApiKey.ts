export function generateApiKey(length: number = 32): string {
    const characters: string = '0123456789abcdef';
    let apiKey: string = '';

    // Create array of random values
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    // Generate the key using crypto-secure random values
    for (let i = 0; i < length; i++) {
        apiKey += characters.charAt(randomValues[i] % characters.length);
    }

    return apiKey;
}
