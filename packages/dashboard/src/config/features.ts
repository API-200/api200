const isSelfHosted = (process.env.NEXT_PUBLIC_IS_SELFHOSTED || '').toString() === 'true'

const FEATURES = {
    AUTH: {
        ENABLE_GOOGLE_AUTH: !isSelfHosted,
    },
    SIDEBAR: {
        SHOW_USAGE: !isSelfHosted,
        SHOW_REGION: !isSelfHosted,
    },
    ANALYTICS: {
        ENABLE_SENTRY: !isSelfHosted,
    },
    EMAILS: !isSelfHosted,
}

export default FEATURES
