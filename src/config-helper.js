const _ = require('lodash')
const config = require('./config/main.json')

function defaultTokenName() {
    return config.defaultPair.token
}

function defaultTokenAddress() {
    return _.filter(config.tokens, (tk) => tk.name === defaultTokenName())[0].addr
}

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
    'defaultTokenName': defaultTokenName,
    'defaultTokenAddress': defaultTokenAddress,
    'tokens': tokens,
    'getTokenName': getTokenName
}
