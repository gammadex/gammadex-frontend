import config from './config/main.json'
import _ from "lodash"

class Config {
    getTokens() {
        return config.tokens
    }

    getTokenName(address) {
        return _.filter(config.tokens, (tk) => tk.address === address)[0].name
    }

    getTokenAddress(name) {
        return _.filter(config.tokens, (tk) => tk.name === name)[0].address
    }

    getDefaultToken() {
        const name = config.defaultPair.token
        const address = this.getTokenAddress(name)

        return {
            name,
            address
        }
    }
}

export default new Config()