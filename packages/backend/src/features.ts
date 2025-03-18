const isSelfHosted = process.env.IS_SELFHOSTED === 'true'

const FEATURES = {
    CHECK_USAGE: !isSelfHosted
}

export default FEATURES