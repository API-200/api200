
export const DAY_MS = 24 * 60 * 60 * 1000;

export const EXTERNAL_ENDPOINTS_SOURCES = ['openapi', 'postman'];

export const PLANS = {
    BASIC: {
        REQUESTS_PER_MONTH: 100
    },
    PRO: {
        REQUESTS_PER_MONTH: 10000
    }
} as const;