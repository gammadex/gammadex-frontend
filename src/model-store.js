const defaultModel = require('./model-default.json')

function load() {
    return null
}

function store(model) {
}

function get() {
    const stored = load()
    if (stored) {
        return stored
    } else {
        return defaultModel
    }
}

module.exports = {
    "store": store,
    "get": get
}
