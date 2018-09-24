import abiEtherDelta from './config/etherdelta.json'
import abiDeltaBalances from './config/deltabalances.json'
import abiToken from './config/token.json'
import Config from './Config'
import Web3 from 'web3'
import Tx from 'ethereumjs-tx'
import OrderFactory from './OrderFactory'
import { truncate } from './util/FormatUtil'
import { safeBigNumber } from './EtherConversion'
import Web3PromiEvent from 'web3-core-promievent'
import { getFavourite } from './util/FavouritesDao'
import Favourites from './util/Favourites'
import { AccountProvider, MetaMaskAccountProvider, WalletAccountProvider} from "./AccountProvider"

let web3 = window.web3

class EtherDeltaWeb3 {
    constructor() {
        this.estimateGas = getFavourite(Favourites.ESTIMATE_GAS) == null ? true : Boolean(getFavourite(Favourites.ESTIMATE_GAS))
        this.tokenContractMap = new Map()
    }

    initForAnonymous = () => {
        this.web3 = new Web3(new Web3.providers.HttpProvider(Config.getWeb3Url()))
        this.accountProvider = new AccountProvider(this.web3)

        this.initContract()
    }

    initForMetaMask = () => {
        // Use Mist/MetaMask's provider
        this.initForMetaMaskWeb3(new Web3(web3.currentProvider))
    }

    // used by test 
    initForMetaMaskWeb3 = (paramWeb3) => {
        this.web3 = paramWeb3
        this.accountProvider = new MetaMaskAccountProvider(paramWeb3, 0)
        this.initContract()
    }

    initForPrivateKey = (walletAddress, walletPrivateKey) => {
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
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = Config.getEtherDeltaAddress()
        this.contractDeltaBalances = new this.web3.eth.Contract(abiDeltaBalances)
        this.contractDeltaBalances.options.address = Config.getDeltaBalancesAddress()
    }

    getOrCreateTokenContract(address) {
        const lowercaseAddress = address.toLowerCase()
        if (this.tokenContractMap.has(lowercaseAddress)) {
            return this.tokenContractMap.get(lowercaseAddress)
        } else {
            const contract = new this.web3.eth.Contract(abiToken)
            contract.options.address = lowercaseAddress
            this.tokenContractMap.set(lowercaseAddress, contract)
            return contract
        }
    }

    refreshAccount() {
        return this.accountProvider.refreshAccount()
    }

    promiseRefreshNonce() {
        return this.accountProvider.promiseRefreshNonce()
    }

    refreshEthAndTokBalance(account, tokenAddress) {
        if(account && tokenAddress) {
            return this.contractDeltaBalances.methods.allBalances(
                Config.getEtherDeltaAddress(),
                account,
                [Config.getBaseAddress(), tokenAddress]
            ).call()
                .then(bal => {
                    return [ bal[1], bal[3], bal[0], bal[2] ]
                })
        } else {
            return Promise.resolve([null, null, null, null])
        }
    }

    promiseTokenBalance(account, tokenAddress) {
        return this.getOrCreateTokenContract(tokenAddress).methods.balanceOf(account).call()
    }

    wrapActionWithGasEstimate(estimateAction, gasEstimateSuccessAction, gasEstimateFallbackAction, maxGasLimit) {
        if (!this.estimateGas) {
            return gasEstimateFallbackAction()
        }

        const promiEvent = Web3PromiEvent()

        estimateAction()
            .then(gasEstimate => {
                const gasToUse = Math.min(gasEstimate, maxGasLimit)
                return gasEstimateSuccessAction(gasToUse)
                    .once('transactionHash', hash => promiEvent.eventEmitter.emit('transactionHash', hash))
                    .on('error', error => {
                        promiEvent.eventEmitter.emit('error', error)
                    })
                    .then(receipt => {
                        promiEvent.resolve(receipt)
                    })
                    .catch(error => {
                        promiEvent.reject(error)
                    })
            })
            .catch(estimateError => {
                return gasEstimateFallbackAction()
                    .once('transactionHash', hash => promiEvent.eventEmitter.emit('transactionHash', hash))
                    .on('error', error => promiEvent.eventEmitter.emit('error', error))
                    .then(receipt => promiEvent.resolve(receipt))
            })

        return promiEvent.eventEmitter
    }

    promiseDepositEther(account, nonce, amount, gasPriceWei) {
        return this.wrapActionWithGasEstimate(
            () => this.contractEtherDelta.methods.deposit().estimateGas({ from: account, value: amount }),
            (gasEstimate) => this.accountProvider.promiseDepositEther(account, nonce, amount, gasPriceWei, gasEstimate),
            () => this.accountProvider.promiseDepositEther(account, nonce, amount, gasPriceWei),
            Config.getGasLimit('deposit')
        )
    }

    promiseWithdrawEther(account, nonce, amount, gasPriceWei) {
        return this.wrapActionWithGasEstimate(
            () => this.contractEtherDelta.methods.withdraw(amount).estimateGas({ from: account }),
            (gasEstimate) => this.accountProvider.promiseWithdrawEther(account, nonce, amount, gasPriceWei, gasEstimate),
            () => this.accountProvider.promiseWithdrawEther(account, nonce, amount, gasPriceWei),
            Config.getGasLimit('withdraw')
        )
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.accountProvider.promiseTokenApprove(account, nonce, tokenAddress, amount, gasPriceWei)
    }

    promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.accountProvider.promiseDepositToken(account, nonce, tokenAddress, amount, gasPriceWei)
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei) {
        return this.accountProvider.promiseWithdrawToken(account, nonce, tokenAddress, amount, gasPriceWei)
    }

    promiseTestTrade(account, order, amount) {
        if (safeBigNumber(amount).isZero()) {
            return Promise.resolve(false)
        }
        return this.contractEtherDelta.methods.testTrade(
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
            order.v == null ? 27 : order.v, // on-chain handling
            order.r == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.r, // on-chain handling
            order.s == null ? "0x0000000000000000000000000000000000000000000000000000000000000000" : order.s, // on-chain handling
        ).call()
    }

    promiseAmountFilled(order) {
        return this.contractEtherDelta.methods.amountFilled(
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
        ).call()
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
        return this.wrapActionWithGasEstimate(
            () => {
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
                    .estimateGas({ from: account })

            },
            (gasEstimate) => this.accountProvider.promiseTrade(account, nonce, order, amount, gasPriceWei, gasEstimate),
            () => this.accountProvider.promiseTrade(account, nonce, order, amount, gasPriceWei),
            Config.getGasLimit('trade')
        )
    }

    promiseOrder(account, nonce, order, gasPriceWei) {
        return this.accountProvider.promiseOrder(account, nonce, order, gasPriceWei)
    }

    promiseCancelOrder(account, nonce, order, gasPriceWei) {
        return this.wrapActionWithGasEstimate(
            () => {
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
                )
                    .estimateGas({ from: account })

            },
            (gasEstimate) => this.accountProvider.promiseCancelOrder(account, nonce, order, gasPriceWei, gasEstimate),
            () => this.accountProvider.promiseCancelOrder(account, nonce, order, gasPriceWei),
            Config.getGasLimit('cancelOrder')
        )
    }

    promiseTransactionReceipt(txHash) {
        return this.web3.eth.getTransactionReceipt(txHash)
    }

    promiseSignData(data, account) {
        return this.accountProvider.promiseSignData(data, account)
    }

    sha3 = (msg) => {
        return this.web3.utils.sha3(`0x${msg.toString('hex')}`, { encoding: 'hex' })
    }

    hexToNumber = (hex) => {
        return this.web3.utils.hexToNumber(hex)
    }

    createNewAccount = () => {
        return this.web3.eth.accounts.create()
    }

    encryptToKeyStore = (privateKey, password) => {
        return this.web3.eth.accounts.encrypt(privateKey, password)
    }

    isAddress(address, validateChecksum = false) {
        const check = validateChecksum ? String(address).toLowerCase() : address

        return web3.util.isAddress(check)
    }

    /**
     * Returns a Promise which will return a Token object with name, symbol, decimals, address fields
     *
     * @param {string} address token address
     */
    promiseGetTokenDetails(address) {
        try {
            const contractToken = this.getOrCreateTokenContract(address)
            return contractToken.methods.totalSupply().call()
            .then(supply => {
                return Promise.all([
                    wrapError(() => contractToken.methods.name().call()),
                    wrapError(() => contractToken.methods.symbol().call()),
                    contractToken.methods.decimals().call(),
                    Promise.resolve(supply)])
            }).then(res => {
                return {
                    address: address,
                    name: res[0].result || truncate(address, { left: "6", right: "0" }),
                    symbol: res[1].result || truncate(address, { left: "6", right: "0" }),
                    decimals: res[2]
                }
            })
        }
        catch (error) {
            return Promise.reject(error)
        }
    }
}

function wrapError(promise) {
    return promise()
        .then(res => {
            return ({
                result: res,
                error: null
            })
        }).catch(error => {
            return {
                result: null,
                error: error
            }
        })
}

export default new EtherDeltaWeb3()