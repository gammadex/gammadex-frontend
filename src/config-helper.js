const _ = require('lodash')
const config = require('./config/main.json')

function tokens() {
    return config.tokens
}

/**
 * TODO - assumes exists, fixme
 */
function getTokenName(address) {
    return _.filter(config.tokens, (tk) => tk.addr === address)[0].name
}

module.exports = {
    'tokens': tokens,
    'getTokenName': getTokenName
}
