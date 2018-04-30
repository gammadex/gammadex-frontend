import abiEtherDelta from './config/etherdelta.json'
import abiToken from './config/token.json'
import Config from './Config'
import * as Web3 from 'web3'
import Tx from 'ethereumjs-tx'
import OrderFactory from './OrderFactory'

let web3 = window.web3
const gasLimit = 250000

class EtherDeltaWeb3 {
    // default accounts are now initialised in BootstrapAccount.initAccounts rather than EtherDeltaWeb3 constructor

    initForMetaMask = () => {
        // Use Mist/MetaMask's provider
        // TODO check whether current metamask is locked
        this.web3 = new Web3(web3.currentProvider)
        this.accountProvider = new MetaMaskAccountProvider(this.web3)

        this.initContract()
    }

    initForPrivateKey = (walletAddress, walletPrivateKey) => {
        console.log(`using private key ${walletPrivateKey} with address ${walletAddress}`)

        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)

        this.web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))
        this.accountProvider = new WalletAccountProvider(this.web3, walletAddress, walletPrivateKey)

        this.initContract()
    }

    initForLedger = (ledgerWeb3, accountIndex) => {
        this.web3 = ledgerWeb3
        this.accountProvider = new MetaMaskAccountProvider(this.web3, accountIndex)

        this.initContract()
    }

    initContract() {
        this.contractToken = new this.web3.eth.Contract(abiToken)
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = Config.getEtherDeltaAddress()
    }

    refreshAccount() {
        return this.accountProvider.refreshAccount()
    }

    promiseRefreshNonce() {
        return this.accountProvider.promiseRefreshNonce()
    }

    refreshEthAndTokBalance(account, tokenAddress) {
        return Promise.all([
            this.web3.eth.getBalance(account),
            this.promiseTokenBalance(account, tokenAddress),
            this.contractEtherDelta.methods.balanceOf(Config.getBaseAddress(), account).call(),
            this.contractEtherDelta.methods.balanceOf(tokenAddress, account).call()
        ])
    }

    promiseTokenBalance(account, tokenAddress) {
        this.contractToken.options.address = tokenAddress
        return this.contractToken.methods.balanceOf(account).call()
    }

    promiseDepositEther(account, nonce, amount, gasPriceWei) {
        return this.accountProvider.promiseDepositEther(account, nonce, amount, gasPriceWei)
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei) {
        return this.accountProvider.promiseWithdrawEther(account, nonce, amount, gasPriceWei)
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.accountProvider.promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei)
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        this.promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei)
            .on('error', error => { console.log(`failed to approve token deposit: ${error.message}`) })
        return this.accountProvider.promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei)
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.accountProvider.promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei)
    }

    promiseTestTrade(account, order, amount) {
        return this.contractEtherDelta.methods.testTrade(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.user,
            order.v,
            order.r,
            order.s,
            amount,
            account).call()
    }

    promiseAvailableVolume(order) {
        return this.contractEtherDelta.methods.availableVolume(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.user,
            order.v,
            order.r,
            order.s).call()
    }

    promiseCurrentBlockNumber() {
        return this.web3.eth.getBlockNumber()
    }

    // amount is in amountGet terms:
    // - if taker is buying TOK (lifts offer), maker is selling TOK = tokenGive
    // and therefore maker is buying ETH = tokenGet. AmountGet in units of ETH
    //
    // - if taker is selling TOK (hits bid), maker is buying TOK = tokenGet
    // and therefore maker is selling ETH = tokenGive. AmountGet in units of TOK
    promiseTrade(account, nonce, order, amount, gasPriceWei) {
        return this.accountProvider.promiseTrade(account, nonce, order, amount, gasPriceWei)
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei) {
        return this.accountProvider.promiseCancelOrder(account, nonce, order, gasPriceWei)
    }

    promiseTransactionReceipt(txHash) {
        return this.web3.eth.getTransactionReceipt(txHash)
    }

    promiseSignData(data, account) {
        return this.accountProvider.promiseSignData(data, account)
    }

    sha3 = (msg) => {
        return this.web3.utils.sha3(`0x${msg.toString('hex')}`, { encoding: 'hex' });
    }

    hexToNumber = (hex) => {
        return this.web3.utils.hexToNumber(hex)
    }

    /**
     * Returns a Promise which will return an array of name, symbol and decimals.
     *
     * @param {string} address token address
     */
    promiseGetTokenDetails(address) {
        try {
            this.contractToken.options.address = address
        }
        catch (error) {
            return Promise.reject(error)
        }

        return Promise.all([this.contractToken.methods.name().call(),
                            this.contractToken.methods.symbol().call(),
                            this.contractToken.methods.decimals().call()]);
    }
}

class AccountProvider {
    constructor(web3) {
        this.web3 = web3
        this.contractToken = new this.web3.eth.Contract(abiToken)
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = Config.getEtherDeltaAddress()
    }

    refreshAccount() { throw new Error("method should be implemented") }
    promiseRefreshNonce() { throw new Error("method should be implemented") }
    promiseDepositEther(account, nonce, amount, gasPriceWei) { throw new Error("method should be implemented") }
    promiseWithdrawEther(account, nonce, amount, gasPriceWei) { throw new Error("method should be implemented") }
    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) { throw new Error("method should be implemented") }
    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) { throw new Error("method should be implemented") }
    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) { throw new Error("method should be implemented") }

    promiseTrade(account, nonce, order, amount, gasPriceWei) { throw new Error("method should be implemented") }
    promiseCancelOrder(account, nonce, order, gasPriceWei) { throw new Error("method should be implemented") }
    promiseSignData(data) { throw new Error("method should be implemented") }

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

    promiseDepositEther(account, nonce, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.deposit()
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei, value: amount })
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.withdraw(amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        this.contractToken.options.address = tokenAddress
        return this.contractToken.methods.approve(Config.getEtherDeltaAddress(), amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.depositToken(tokenAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseTrade(account, nonce, order, amount, gasPriceWei) {
        return this.contractEtherDelta.methods.trade(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.user,
            order.v,
            order.r,
            order.s,
            amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei) {
        return this.contractEtherDelta.methods.cancelOrder(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.v,
            order.r,
            order.s)
            .send({ from: account, gas: gasLimit, gasPrice: gasPriceWei })
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

    promiseSendRawTransaction(nonce, txTo, txValue, txData, gasPriceWei) {
        const rawTx = {
            nonce: this.web3.utils.numberToHex(nonce),
            gasPrice: this.web3.utils.numberToHex(gasPriceWei),
            gasLimit: this.web3.utils.numberToHex(gasLimit),
            to: txTo,
            value: txValue,
            data: txData
        }
        let tx = new Tx(rawTx);
        const privateKey = new Buffer(this.walletPrivateKey, 'hex')
        tx.sign(privateKey);
        return this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
    }

    promiseDepositEther(account, nonce, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(amount),
            this.contractEtherDelta.methods.deposit().encodeABI(),
            gasPriceWei)
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdraw(amount).encodeABI(),
            gasPriceWei)
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        this.contractToken.options.address = tokenAddress
        return this.promiseSendRawTransaction(nonce, tokenAddress,
            this.web3.utils.numberToHex(0),
            this.contractToken.methods.approve(Config.getEtherDeltaAddress(), amount).encodeABI(),
            gasPriceWei)
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce + 1, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.depositToken(tokenAddress, amount).encodeABI(),
            gasPriceWei)
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount).encodeABI(),
            gasPriceWei)
    }

    promiseTrade(account, nonce, order, amount, gasPriceWei) {
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
                order.v,
                order.r,
                order.s,
                amount).encodeABI(),
                gasPriceWei)
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.cancelOrder(
                order.tokenGet,
                order.amountGet,
                order.tokenGive,
                order.amountGive,
                order.expires,
                order.nonce,
                order.v,
                order.r,
                order.s).encodeABI(),
                gasPriceWei)
    }

    promiseSignData(data, account) {
        return Promise.resolve(OrderFactory.sign(data, this.walletPrivateKey))
    }
}

export default new EtherDeltaWeb3()