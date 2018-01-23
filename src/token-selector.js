const $ = require('jquery')
require('select2')(window, $)
const configHelper = require('./config-helper.js')

function bind(selectElementId, onChange) {
    const select = $(selectElementId)
    select.select2()

    const tokens = configHelper.tokens()
    tokens.forEach((tk) => {
        select.append(new Option(tk.name, tk.addr, false, false))
    })

    select.val(configHelper.defaultTokenAddress())
    select.change(onChange)
    select.trigger('change')
}

module.exports = {
    'bind': bind
}
