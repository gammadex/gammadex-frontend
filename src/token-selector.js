const $ = require('jquery')
require('select2')(window, $)
const configHelper = require('./config-helper.js')

let select = null

function bind(selectElementId, onChange) {
    select = $(selectElementId)
    select.select2()

    // TODO - sort me
    const tokens = configHelper.tokens()
    tokens.forEach((tk) => {
        select.append(new Option(tk.name, tk.addr, false, false))
    })

    select.change(onChange)
}

function setValue(value, triggerChange) {
    select.val(value)

    if (triggerChange) {
        select.trigger('change')
    }
}

module.exports = {
    'bind': bind,
    'setValue': setValue
}
