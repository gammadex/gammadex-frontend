import abiEtherDelta from './config/etherdelta.json'
import abiToken from './config/token.json'
import Config from './Config'
import * as Web3 from 'web3'
import Tx from 'ethereumjs-tx'
import createLedgerSubprovider from "./hacks/LedgerWeb3SubProvider"
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import ProviderEngine from "web3-provider-engine";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";

let web3 = window.web3
const gasLimit = 250000
const gasPrice = 10 * 1000000000

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

    initForLedger = () => {
        const engine = new ProviderEngine()
        const getTransport = () => TransportU2F.create();
        // We need our own version of createLedgerSubprovider since the Ledger provided one has a bug with
        // address lookup when using web3 1.0.x - TODO - file a bug report - WR
        const ledger = createLedgerSubprovider(getTransport, {
            networkId: 3,
            accountsLength: 5
        });
        engine.addProvider(ledger);
        engine.addProvider(new RpcSubprovider({ rpcUrl: Config.getWeb3Url() }));
        engine.start();

        // engineWithNoEventEmitting is needed because infura doesn't support newBlockHeaders event :( - WR
        // https://github.com/ethereum/web3.js/issues/951
        const engineWithNoEventEmitting = Object.assign(engine, { on: false });
        this.web3 = new Web3(engineWithNoEventEmitting);
        this.accountProvider = new MetaMaskAccountProvider(this.web3)

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

    promiseDepositEther(account, nonce, amount) {
        return this.accountProvider.promiseDepositEther(account, nonce, amount)
    }

    promiseWithdrawEther(account, nonce, amount) {
        return this.accountProvider.promiseWithdrawEther(account, nonce, amount)
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount) {
        return this.accountProvider.promiseTokenApprove(account, nonce, tokenAddress, amount)
    }

    promiseDepositToken(account, nonce, tokenAddress, amount) {
        this.promiseTokenApprove(account, nonce, tokenAddress, amount)
            .on('error', error => { console.log(`failed to approve token deposit: ${error.message}`) })
        return this.accountProvider.promiseDepositToken(account, nonce, tokenAddress, amount)
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount) {
        return this.accountProvider.promiseWithdrawToken(account, nonce, tokenAddress, amount)
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
    promiseTrade(account, nonce, order, amount) {
        return this.accountProvider.promiseTrade(account, nonce, order, amount)
    }

    promiseTransactionReceipt(txHash) {
        return this.web3.eth.getTransactionReceipt(txHash)
    }

    sha3 = (msg) => {
        return this.web3.utils.sha3(`0x${msg.toString('hex')}`, { encoding: 'hex' });
    }

    hexToNumber = (hex) => {
        return this.web3.utils.hexToNumber(hex)
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
    promiseDepositEther(account, nonce, amount) { throw new Error("method should be implemented") }
    promiseWithdrawEther(account, nonce, amount) { throw new Error("method should be implemented") }
    promiseTokenApprove(account, nonce, tokenAddress, amount) { throw new Error("method should be implemented") }
    promiseDepositToken(account, nonce, tokenAddress, amount) { throw new Error("method should be implemented") }
    promiseWithdrawToken(account, nonce, tokenAddress, amount) { throw new Error("method should be implemented") }

    promiseTrade(account, nonce, order, amount) { throw new Error("method should be implemented") }
}

class MetaMaskAccountProvider extends AccountProvider {
    constructor(web3) {
        super(web3)
    }

    refreshAccount() {
        return this.web3.eth.getAccounts()
            .then(accounts => {
                if (accounts.length > 0) {
                    // MetaMask tracks the nonce itself
                    return { address: accounts[0], nonce: 0 }
                } else {
                    throw new Error("no addresses found")
                }
            })
    }

    promiseRefreshNonce() {
        return Promise.resolve(0)
    }

    promiseDepositEther(account, nonce, amount) {
        return this.contractEtherDelta.methods.deposit()
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice, value: amount })
    }

    promiseWithdrawEther(account, nonce, amount) {
        return this.contractEtherDelta.methods.withdraw(amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount) {
        this.contractToken.options.address = tokenAddress
        return this.contractToken.methods.approve(Config.getEtherDeltaAddress(), amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseDepositToken(account, nonce, tokenAddress, amount) {
        return this.contractEtherDelta.methods.depositToken(tokenAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount) {
        return this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseTrade(account, nonce, order, amount) {
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
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
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

    promiseSendRawTransaction(nonce, txTo, txValue, txData) {
        const rawTx = {
            nonce: this.web3.utils.numberToHex(nonce),
            gasPrice: this.web3.utils.numberToHex(gasPrice),
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

    promiseDepositEther(account, nonce, amount) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(amount),
            this.contractEtherDelta.methods.deposit().encodeABI())
    }

    promiseWithdrawEther(account, nonce, amount) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdraw(amount).encodeABI())
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount) {
        this.contractToken.options.address = tokenAddress
        return this.promiseSendRawTransaction(nonce, tokenAddress,
            this.web3.utils.numberToHex(0),
            this.contractToken.methods.approve(Config.getEtherDeltaAddress(), amount).encodeABI())
    }

    promiseDepositToken(account, nonce, tokenAddress, amount) {
        return this.promiseSendRawTransaction(nonce + 1, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.depositToken(tokenAddress, amount).encodeABI())
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount) {
        return this.promiseSendRawTransaction(nonce, Config.getEtherDeltaAddress(),
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount).encodeABI())
    }

    promiseTrade(account, nonce, order, amount) {
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
                amount).encodeABI())
    }
}

export default new EtherDeltaWeb3()