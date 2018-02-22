import abiEtherDelta from './config/etherdelta.json'
import abiToken from './config/token.json'
import * as Web3 from 'web3'
import Tx from 'ethereumjs-tx'

import createLedgerSubprovider from "./hacks/LedgerWeb3SubProvider"
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import ProviderEngine from "web3-provider-engine";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";

let web3 = window.web3
const ethAddress = "0x0000000000000000000000000000000000000000"
const etherDeltaAddress = "0x228344536a03c0910fb8be9c2755c1a0ba6f89e1"
const gasLimit = 250000
const gasPrice = 10 * 1000000000

// non-MetaMask
const fallbackWalletAddress = "0xed230018BF455D72D8b6D416FE2e1b1D8d5D9376"
const fallbackWalletPrivateKey = "222941a07030ef2477b547da97259a33f4e3a6febeb081da8210cffc86dd138f"
const useLedger = false

class EtherDeltaWeb3 {
    constructor() {
        if (useLedger) {
            this.initForLedger()
        } else if (typeof web3 !== "undefined") { // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            this.initForMetaMask()
        } else {
            this.initForPrivateKey(fallbackWalletAddress, fallbackWalletPrivateKey)
        }
    }

    // eugh, puke
    getWeb3 = () => {
        return this.web3
    }

    initForMetaMask = () => {
        // Use Mist/MetaMask's provider
        // TODO check whether current metamask is locked
        this.web3 = new Web3(web3.currentProvider)
        this.isMetaMask = true
        this.accountProvider = new MetaMaskAccountProvider(this.web3)

        this.initContract()
    }

    initForPrivateKey = (walletAddress, walletPrivateKey) => {
        console.log(`using private key ${walletPrivateKey} with address ${walletAddress}`)

        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        // TODO use infura or another public node

        this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"))
        this.isMetaMask = false
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
        engine.addProvider(new RpcSubprovider({ rpcUrl: 'https://ropsten.infura.io' }));
        engine.start();

        // engineWithNoEventEmitting is needed because infura doesn't support newBlockHeaders event :( - WR
        // https://github.com/ethereum/web3.js/issues/951
        const engineWithNoEventEmitting = Object.assign(engine, { on: false });
        this.web3 = new Web3(engineWithNoEventEmitting);
        this.isMetaMask = true // TODO - correct use of this variable
        this.accountProvider = new MetaMaskAccountProvider(this.web3)

        this.initContract()
    }

    initContract() {
        this.contractToken = new this.web3.eth.Contract(abiToken)
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = etherDeltaAddress
    }

    getIsMetaMask() {
        return this.isMetaMask
    }

    refreshAccount() {
        return this.accountProvider.refreshAccount()
    }

    refreshEthAndTokBalance(account, tokenAddress) {
        return Promise.all([
            this.web3.eth.getBalance(account),
            this.promiseTokenBalance(account, tokenAddress),
            this.contractEtherDelta.methods.balanceOf(ethAddress, account).call(),
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

    promiseTrade(account, nonce, order, amount) {
        return this.accountProvider.promiseTrade(account, nonce, order, amount)
    }
}

class AccountProvider {
    constructor(web3) {
        this.web3 = web3
        this.contractToken = new this.web3.eth.Contract(abiToken)
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = etherDeltaAddress
    }

    refreshAccount() { throw new Error("method should be implemented") }
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
        return this.contractToken.methods.approve(etherDeltaAddress, amount)
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
        return this.promiseSendRawTransaction(nonce, etherDeltaAddress,
            this.web3.utils.numberToHex(amount),
            this.contractEtherDelta.methods.deposit().encodeABI())
    }

    promiseWithdrawEther(account, nonce, amount) {
        return this.promiseSendRawTransaction(nonce, etherDeltaAddress,
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdraw(amount).encodeABI())
    }

    promiseTokenApprove(account, nonce, tokenAddress, amount) {
        this.contractToken.options.address = tokenAddress
        return this.promiseSendRawTransaction(nonce, tokenAddress,
            this.web3.utils.numberToHex(0),
            this.contractToken.methods.approve(etherDeltaAddress, amount).encodeABI())
    }

    promiseDepositToken(account, nonce, tokenAddress, amount) {
        return this.promiseSendRawTransaction(nonce + 1, etherDeltaAddress,
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.depositToken(tokenAddress, amount).encodeABI())
    }

    promiseWithdrawToken(account, nonce, tokenAddress, amount) {
        return this.promiseSendRawTransaction(nonce, etherDeltaAddress,
            this.web3.utils.numberToHex(0),
            this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount).encodeABI())
    }

    promiseTrade(account, nonce, order, amount) {
        return this.promiseSendRawTransaction(nonce, etherDeltaAddress,
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