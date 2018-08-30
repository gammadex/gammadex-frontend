export default {
    SYMBOL: (balance) => {return balance.token.symbol},
    NAME: (balance) => {return balance.token.name},
    WALLET_BALANCE: (balance) => {return [balance.walletBalance, balance.token.symbol]},
    WALLET_BALANCE_ETH: (balance) => {return [balance.walletBalanceEth, balance.token.symbol]},
    WALLET_BALANCE_USD: (balance) => {return [balance.walletBalanceUsd, balance.token.symbol]},
    EXCHANGE: (balance) => {return [balance.exchangeBalance, balance.token.symbol]},
    EXCHANGE_ETH: (balance) => {return [balance.exchangeBalanceEth, balance.token.symbol]},
    EXCHANGE_USD: (balance) => {return [balance.exchangeBalanceUsd, balance.token.symbol]},
    TOKEN_ADDRESS: (balance) => {return [balance.token.address, balance.token.symbol]},
}