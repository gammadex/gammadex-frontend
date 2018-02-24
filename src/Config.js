import config from './config/main.json'
import _ from "lodash"

class Config {
    constructor() {
        const tokens = config.tokens.map((tk) => {
            return {
                value: tk.address,
                label: tk.name
            }
        })
        this.tokens = _.sortBy(tokens, (tk) => tk.label)
    }

    getTokens() {
        return this.tokens
    }

    getTokenName(address) {
        return _.filter(config.tokens, (tk) => tk.address === address)[0].name
    }

    getTokenAddress(name) {
        return _.filter(config.tokens, (tk) => tk.name === name)[0].address
    }

    getTokenDecimals(name) {
        return _.filter(config.tokens, (tk) => tk.name === name)[0].decimals
    }

    getBaseAddress() { return "0x0000000000000000000000000000000000000000" }
    
    getBaseDecimals() { return 18 }

    getDefaultToken() {
        const name = config.defaultPair.token
        const address = this.getTokenAddress(name)

        return {
            name,
            address
        }
    }

    getDefaultPageSize() {
        return 10
    }
}

export default new Config()