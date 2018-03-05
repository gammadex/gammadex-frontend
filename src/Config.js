import config from './config/main.json'
import _ from "lodash"

class Config {
    constructor() {
        const tokens = this.getEnvTokens().map((tk) => {
            return {
                value: tk.address,
                label: tk.name
            }
        })
        this.tokens = _.sortBy(tokens, (tk) => tk.label)
    }

    getEnv() {
        return config[`${process.env.NODE_ENV}`]
    }

    getEnvTokens() {
        return this.getEnv().tokens
    }

    getTokens() {
        return this.tokens
    }

    getTokenName(address) {
        return _.filter(this.getEnvTokens(), (tk) => tk.address === address)[0].name
    }

    getTokenAddress(name) {
        return _.filter(this.getEnvTokens(), (tk) => tk.name === name)[0].address
    }

    getTokenDecimals(name) {
        return _.filter(this.getEnvTokens(), (tk) => tk.name === name)[0].decimals
    }

    getBaseAddress() {
        return config.baseAddress
    }

    getBaseDecimals() {
        return config.baseDecimals
    }

    getDefaultToken() {
        const name = this.getEnv().defaultPair.token
        const address = this.getTokenAddress(name)

        return {
            name,
            address
        }
    }

    getDefaultPageSize() {
        return 10
    }

    getWeb3Url() {
        return this.getEnv().web3
    }

    getEtherscanUrl() {
        return this.getEnv().etherscan
    }

    getEtherDeltaAddress() {
        return this.getEnv().etherDeltaAddress
    }

    getEthereumNetworkId() {
        return this.getEnv().ethereumNetworkId
    }
}

export default new Config()