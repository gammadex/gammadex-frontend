import config from './config/main.json'

class Config {
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

    getBaseAddress() {
        return config.baseAddress
    }

    getBaseDecimals() {
        return config.baseDecimals
    }

    getSmallOrderThreshold() {
        return config.smallOrderThreshold
    }

    getAwayFromLastTradeThreshold() {
        return config.awayFromLastTradeThreshold
    }

    getMinRecommendedWalletGasEth() {
        return config.minRecommendedWalletGasEth
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

    getSocketEnv() {
        return process.env.SOCKET
    }

    getSocket() {
        const env = this.getSocketEnv() ? this.getSocketEnv() : 'default'
        return this.getEnv().sockets[env]
    }

    getGasLimit(action) {
        if(this.getEnv().gasLimit) {
            return this.getEnv().gasLimit[action]
        }
        return config.gasLimit[action]
    }

    getExchangeFeePercent() {
        return config.exchangeFeePercent
    }

    getBlocksGoodTillCancel() {
        return config['blocksGoodTillCancel']
    }    
}

export default new Config()