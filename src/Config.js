import config from './config/main.json'
import _ from "lodash"
import {addressesLooselyMatch, symbolsLooselyMatch} from './util/KeyUtil'

class Config {
    constructor() {
        const tokens = this.getEnvTokens().map((tk) => {
            return {
                value: tk.address,
                label: tk.name
            }
        })
        this.tokens = _.sortBy(tokens, (tk) => tk.label).filter(tk => tk.label !== "ETH")
    }

    isDevelopment() {
        return this.getReactEnv() === "development"
    }

    getReactEnv() {
        // Why we use a custom env var and not NODE_ENV:
        // https://github.com/facebook/create-react-app/issues/436
        return process.env.REACT_APP_ENV
    }

    getEnv() {
        const env = this.getReactEnv() ? this.getReactEnv() : 'production' // default set so tests can use Config.xxx
        return config[env]
    }

    getEnvTokens() {
        return this.getEnv().tokens
    }

    getTokens() {
        return this.tokens
    }

    // TODO - all these token functions should be somewhere else. Maybe cleanup when we start supporting custom tokens

    getTokenBySymbolOrAddress(symbolOrAddress) {
        const matchingTokens = _.filter(this.getEnvTokens(),
            (tk) => {
                return addressesLooselyMatch(tk.address.toLowerCase(), symbolOrAddress.toLowerCase()) ||
                    symbolsLooselyMatch(tk.name.toLowerCase(), symbolOrAddress.toLowerCase())
            }
        )

        return (matchingTokens.length > 0) ? matchingTokens[0] : null
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

    getTokenDecimalsByAddress(address) {
        return _.filter(this.getEnvTokens(), (tk) => tk.address === address)[0].decimals
    }

    getBaseAddress() {
        return config.baseAddress
    }

    getBaseDecimals() {
        return config.baseDecimals
    }

    getSmallOrderThreshold() {
        return config.smallOrderThreshold
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