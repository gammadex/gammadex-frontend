import abiEtherDelta from './config/etherdelta.json'
import abiToken from './config/token.json'
import Config from './Config'
import Tx from 'ethereumjs-tx'
import OrderFactory from './OrderFactory'
import { truncate } from './util/FormatUtil'
import { safeBigNumber } from './EtherConversion'
import Web3PromiEvent from 'web3-core-promievent'
import { getFavourite } from './util/FavouritesDao'
import Favourites from './util/Favourites'
import EtherDeltaWeb3 from './EtherDeltaWeb3'

class AccountProvider {
    constructor(web3) {
        this.web3 = web3
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = Config.getEtherDeltaAddress()
    }

    refreshAccount() {
        throw new Error("method not implemented")
    }

    promiseRefreshNonce() {
        throw new Error("method not implemented")
    }

    promiseDepositEther(account, nonce, amount, gasPriceWei, gasLimit = Config.getGasLimit('deposit')) {
        throw new Error("method not implemented")
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei, gasLimit = Config.getGasLimit('withdraw')) {
        throw new Error("method not implemented")
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        throw new Error("method not implemented")
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        throw new Error("method not implemented")
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        throw new Error("method not implemented")
    }

    promiseTrade(account, nonce, order, amount, gasPriceWei, gasLimit = Config.getGasLimit('trade')) {
        throw new Error("method not implemented")
    }

    promiseOrder(account, nonce, order, gasPriceWei) {
        throw new Error("method not implemented")
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei, gasLimit = Config.getGasLimit('cancelOrder')) {
        throw new Error("method not implemented")
    }

    promiseSignData(data) {
        throw new Error("method not implemented")
    }

}

class MetaMaskAccountProvider extends AccountProvider {
    constructor(web3, accountIndex = 0) {
        super(web3)
        this.accountIndex = accountIndex
    }

    refreshAccount() {
        return this.web3.eth.getAccounts()
            .then(accounts => {
                if (accounts.length > 0) {
                    // MetaMask tracks the nonce itself
                    return { address: accounts[this.accountIndex], nonce: 0 }
                } else {
                    throw new Error("no addresses found")
                }
            })
    }

    promiseRefreshNonce() {
        return Promise.resolve(0)
    }

    promiseDepositEther(account, nonce, amount, gasPriceWei, gasLimit = Config.getGasLimit('deposit')) {
        return this.contractEtherDelta.methods.deposit()
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei, value: amount })
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei, gasLimit = Config.getGasLimit('withdraw')) {
        return this.contractEtherDelta.methods.withdraw(amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        return EtherDeltaWeb3.getOrCreateTokenContract(tokenAddress).methods.approve(Config.getEtherDeltaAddress(), amount)
            .send({ from: account, gas: Config.getGasLimit('approveTokenDeposit'), gasPrice: gasPriceWei })
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.depositToken(tokenAddress, amount)
            .send({ from: account, gas: Config.getGasLimit('depositToken'), gasPrice: gasPriceWei })
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount)
            .send({ from: account, gas: Config.getGasLimit('withdrawToken'), gasPrice: gasPriceWei })
    }

    promiseTrade(account, nonce, order, amount, gasPriceWei, gasLimit = Config.getGasLimit('trade')) {
        return this.contractEtherDelta.methods.trade(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.user,
            order.v == null ? 27 : order.v, // on-chain handling
            order.r == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.r, // on-chain handling
            order.s == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.s, // on-chain handling
            amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
        // .send({ from: account, gas: Config.getGasLimit('trade'), gasPrice: gasPriceWei })
    }

    promiseOrder(account, nonce, order, gasPriceWei) {
        return this.contractEtherDelta.methods.order(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce)
            .send({ from: account, gas: Config.getGasLimit('order'), gasPrice: gasPriceWei })
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei, gasLimit = Config.getGasLimit('cancelOrder')) {
        return this.contractEtherDelta.methods.cancelOrder(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.v == null ? 27 : order.v, // on-chain handling
            order.r == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.r, // on-chain handling
            order.s == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.s, // on-chain handling
        ).send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseSignData(data, account) {
        const prefixedMessage = OrderFactory.prefixMessage(data)
        return this.web3.eth.sign(prefixedMessage, account)
            .then(rawSig => {
                const sig = rawSig.slice(2)
                const r = `0x${sig.slice(0, 64)}`
                const s = `0x${sig.slice(64, 128)}`
                const v = this.web3.utils.hexToNumber(`0x${sig.slice(128, 130)}`)
                return {
                    msg: prefixedMessage,
                    r: r,
                    s: s,
                    v: v
                }
            })
    }
}

class WalletAccountProvider extends AccountProvider {
    constructor(web3, walletAddress, walletPrivateKey) {
        super(web3)
        this.walletAddress = walletAddress
        this.walletPrivateKey = walletPrivateKey
    }

    refreshAccount() {
        return this.web3.eth.getTransactionCount(this.walletAddress)
            .then(nonce => {
                return { address: this.walletAddress, nonce: nonce }
            })
    }

    promiseRefreshNonce() {
        return this.web3.eth.getTransactionCount(this.walletAddress)
    }

    promiseSendRawTransaction(nonce, txTo, txValue, txData, gasPriceWei, gasLimit) {
        const rawTx = {
            nonce: this.web3.utils.numberToHex(nonce),
            gasPrice: this.web3.utils.numberToHex(gasPriceWei),
            gasLimit: this.web3.utils.numberToHex(gasLimit),
            to: txTo,
            value: txValue,
            data: txData
        }
        let tx = new Tx(rawTx)
        const privateKey = new Buffer(this.walletPrivateKey, 'hex')
        tx.sign(privateKey)
        return this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
    }

    promiseDepositEther(account, nonce, amount, gasPriceWei, gasLimit = Config.getGasLimit('deposit')) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(amount),
            this.contractEtherDelta.methods.deposit().encodeABI(),
            gasPriceWei,
            gasLimit)
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei, gasLimit = Config.getGasLimit('withdraw')) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdraw(amount).encodeABI(),
            gasPriceWei,
            gasLimit)
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, tokenAddress,
            this.web3.utils.numberToHex(0),
            EtherDeltaWeb3.getOrCreateTokenContract(tokenAddress).methods.approve(Config.getEtherDeltaAddress(), amount).encodeABI(),
            gasPriceWei,
            Config.getGasLimit('approveTokenDeposit'))
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.depositToken(tokenAddress, amount).encodeABI(),
            gasPriceWei,
            Config.getGasLimit('depositToken'))
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount).encodeABI(),
            gasPriceWei,
            Config.getGasLimit('withdrawToken'))
    }

    promiseTrade(account, nonce, order, amount, gasPriceWei, gasLimit = Config.getGasLimit('trade')) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.trade(
                order.tokenGet,
                order.amountGet,
                order.tokenGive,
                order.amountGive,
                order.expires,
                order.nonce,
                order.user,
                order.v == null ? 27 : order.v, // on-chain handling
                order.r == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.r, // on-chain handling
                order.s == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.s, // on-chain handling,
                amount).encodeABI(),
            gasPriceWei,
            gasLimit)
        // Config.getGasLimit('trade'))
    }

    promiseOrder(account, nonce, order, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.order(
                order.tokenGet,
                order.amountGet,
                order.tokenGive,
                order.amountGive,
                order.expires,
                order.nonce
            ).encodeABI(),
            gasPriceWei,
            Config.getGasLimit('order'))
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei, gasLimit = Config.getGasLimit('cancelOrder')) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.cancelOrder(
                order.tokenGet,
                order.amountGet,
                order.tokenGive,
                order.amountGive,
                order.expires,
                order.nonce,
                order.v == null ? 27 : order.v, // on-chain handling
                order.r == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.r, // on-chain handling
                order.s == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.s, // on-chain handling
            ).encodeABI(),
            gasPriceWei,
            gasLimit)
    }

    promiseSignData(data, account) {
        return Promise.resolve(OrderFactory.sign(data, this.walletPrivateKey))
    }
}

export {
    AccountProvider,
    WalletAccountProvider,
    MetaMaskAccountProvider
}