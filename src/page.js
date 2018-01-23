const configHelper = require('./config-helper.js')
const $ = require('jquery')

function choseTokenByAddress(address) {
    const tokenName = configHelper.getTokenName(address)

    $('#bidsToken')[0].innerText = tokenName
    $('#offersToken')[0].innerText = tokenName
}

module.exports = {
    'choseTokenByAddress': choseTokenByAddress
}
