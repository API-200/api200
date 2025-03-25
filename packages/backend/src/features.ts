const isSelfHosted = process.env.IS_SELFHOSTED === 'true'

const FEATURES = {
    CHECK_USAGE: !isSelfHosted,
    EMAILS: !isSelfHosted
}

export default FEATURES