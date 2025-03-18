import { Tables } from '../utils/database.types';
import { AxiosRequestConfig } from 'axios';
import { createDecipheriv } from 'crypto';
import { config } from '../utils/config';

interface AuthConfig {
    api_key?: string;
    bearer_token?: string;
    api_key_param?: string;
    api_key_header?: string;
    api_key_location: 'header' | 'query';
}

function decrypt(encryptedText: string) {
    const [ivHex, tagHex, contentHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(contentHex, "hex");
    const decipher = createDecipheriv(
        "aes-256-gcm",
        Buffer.from(config.ENCRYPTION_KEY, "hex"),
        iv
    );
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final("utf8");
}

// TODO COOKIE AUTH?
//'api_key' | 'token'
export function applyThirdPartyAuth(
    routeData: Tables<'services'>,
    safeHeaders: Record<string, string>,
    axiosConfig: AxiosRequestConfig,
) {
    const config = routeData.auth_config as unknown as AuthConfig;
    const newHeaders = { ...safeHeaders };
    const updatedConfig = { ...axiosConfig };

    if (routeData.auth_type === 'api_key') {
        if (config.api_key_location === 'header' && config.api_key_header) {
            newHeaders[config.api_key_header] = decrypt(config.api_key!);
        } else if (
            config.api_key_location === 'query' &&
            config.api_key_param
        ) {
            const urlObj = new URL(axiosConfig.url!);
            urlObj.searchParams.append(decrypt(config.api_key_param), config.api_key!);
            updatedConfig.url = urlObj.toString();
        }
    } else {
        newHeaders['Authorization'] = `Bearer ${decrypt(config.bearer_token!)}`;
    }

    return { headers: newHeaders, config: updatedConfig };
}
