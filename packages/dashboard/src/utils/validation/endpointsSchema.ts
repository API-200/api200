import { z } from "zod";

// Constants for validation
const VALID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-~.%!$&'()*+,;=:@";
const MAX_PARAM_LENGTH = 50;
const MAX_SEGMENT_LENGTH = 100;

// Helper function to extract parameters from a path
const extractParams = (path: string): string[] => {
    const params: string[] = [];
    const segments = path.slice(1).split('/');

    for (const segment of segments) {
        if (segment.startsWith('{') && segment.endsWith('}')) {
            const paramName = segment.slice(1, -1);
            if (paramName.length > 0) {
                params.push(paramName);
            }
        }
    }

    return params;
};

// Detailed path segment validation with specific error messages
const validatePathSegment = (segment: string): { isValid: boolean; error?: string } => {
    if (segment.length === 0) {
        return { isValid: false, error: "Empty segments are not allowed" };
    }

    if (segment.length > MAX_SEGMENT_LENGTH) {
        return { isValid: false, error: `Segment exceeds maximum length of ${MAX_SEGMENT_LENGTH} characters` };
    }

    // Parameter validation
    if (segment.startsWith('{') && segment.endsWith('}')) {
        const paramName = segment.slice(1, -1);

        if (paramName.length === 0) {
            return { isValid: false, error: "Empty parameter names are not allowed" };
        }

        if (paramName.length > MAX_PARAM_LENGTH) {
            return { isValid: false, error: `Parameter name exceeds maximum length of ${MAX_PARAM_LENGTH} characters` };
        }

        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(paramName)) {
            return {
                isValid: false,
                error: "Parameter names must start with a letter and contain only letters, numbers, and underscores"
            };
        }

        return { isValid: true };
    }

    // Regular segment validation
    const invalidChars = segment.split('').filter(char => !VALID_CHARS.includes(char));
    if (invalidChars.length > 0) {
        return {
            isValid: false,
            error: `Invalid characters found: ${invalidChars.join(', ')}. Only letters, numbers, and ${VALID_CHARS} are allowed`
        };
    }

    return { isValid: true };
};

// Enhanced path validation with detailed error reporting
const validatePath = (path: string): { isValid: boolean; error?: string } => {
    if (!path.startsWith('/')) {
        return { isValid: false, error: "Path must start with a forward slash (/)" };
    }

    if (path === '/') {
        return { isValid: true };
    }

    const segments = path.slice(1).split('/');

    // Check for consecutive slashes
    if (segments.includes('')) {
        return { isValid: false, error: "Consecutive slashes are not allowed" };
    }

    // Validate each segment
    for (const segment of segments) {
        const validation = validatePathSegment(segment);
        if (!validation.isValid) {
            return validation;
        }
    }

    return { isValid: true };
};

// Enhanced parameter matching validation
const validateMatchingParams = (path: string, name: string): { isValid: boolean; error?: string } => {
    const pathParams = extractParams(path);
    const nameParams = extractParams(name);

    const pathParamsSet = new Set(pathParams);
    const nameParamsSet = new Set(nameParams);

    // Find mismatched parameters
    const missingInPath = nameParams.filter(param => !pathParamsSet.has(param));
    const missingInName = pathParams.filter(param => !nameParamsSet.has(param));

    if (missingInPath.length > 0 || missingInName.length > 0) {
        const errors: string[] = [];
        if (missingInPath.length > 0) {
            errors.push(`Parameters missing in path: {${missingInPath.join('}, {')}}`);
        }
        if (missingInName.length > 0) {
            errors.push(`Parameters missing in name: {${missingInName.join('}, {')}}`);
        }
        return { isValid: false, error: errors.join('. ') };
    }

    return { isValid: true };
};

export const endpointSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .refine(
            (name) => {
                const validation = validatePath(name);
                return validation.isValid;
            },
            (name) => ({
                message: validatePath(name).error || "Invalid path format"
            })
        ),
    path: z.string()
        .min(1, "Path is required")
        .refine(
            (path) => {
                const validation = validatePath(path);
                return validation.isValid;
            },
            (path) => ({
                message: validatePath(path).error || "Invalid path format"
            })
        ),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    caching: z.boolean(),
    cache_ttl_s: z.union([
        z.string(),
        z.string()
            .transform(s => parseInt(s))
            .pipe(z.number().min(0, "Cache TTL cannot be negative").max(86400, "Cache TTL cannot exceed 24 hours"))
            .transform(n => n.toString())
    ]).optional(),
    retryEnabled: z.boolean().optional(),
    maxRetries: z.union([
        z.string(),
        z.string()
            .transform(s => parseInt(s))
            .pipe(z.number().min(0, "Number of retries cannot be negative").max(5, "Maximum 5 retries allowed"))
            .transform(n => n.toString())
    ]).optional(),
    retryInterval: z.union([
        z.string(),
        z.string()
            .transform(s => parseInt(s))
            .pipe(z.number().min(1, "Retry interval must be at least 1 second").max(60, "Retry interval cannot exceed 60 seconds"))
            .transform(n => n.toString())
    ]).optional(),
    fallback_response_enabled: z.boolean().optional(),
    fallbackResponse: z.string().max(1000, "Fallback response cannot exceed 1KB").optional(),
    fallbackStatusCode: z.union([z.string(), z.nan()]).optional(),
    transformationCode: z.string().max(1000000, "Transformation code cannot exceed 1MB").optional(),
    transformationEnabled: z.boolean().optional(),
    transformationPrompt: z.string().optional(),
    mockData: z.string().max(1000000, "Mock data cannot exceed 1MB").optional(),
    mockStatusCode: z.union([z.string(), z.nan()]).optional(),
    mockEnabled: z.boolean().optional(),
}).refine(
    (data) => {
        const validation = validateMatchingParams(data.path, data.name);
        return validation.isValid;
    },
    (data) => ({
        message: validateMatchingParams(data.path, data.name).error || "Path and name parameters do not match",
        path: ["path"]
    })
);
