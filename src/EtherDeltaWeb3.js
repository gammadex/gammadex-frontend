import abiEtherDelta from './config/etherdelta.json'
import abiToken from './config/token.json'
import * as Web3 from 'web3'
import Tx from 'ethereumjs-tx'
//const Tx = require('ethereumjs-tx')
let web3 = window.web3
const ethAddress = "0x0000000000000000000000000000000000000000"
const etherDeltaAddress = "0x228344536a03c0910fb8be9c2755c1a0ba6f89e1"
const gasLimit = 250000
const gasPrice = 10 * 1000000000

// non-MetaMask
const walletAddress = "0xed230018BF455D72D8b6D416FE2e1b1D8d5D9376"
const walletPrivateKey = "222941a07030ef2477b547da97259a33f4e3a6febeb081da8210cffc86dd138f"

class EtherDeltaWeb3 {
    constructor() {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== "undefined") {
            // Use Mist/MetaMask's provider
            // TODO check whether current metamask is locked
            console.log("MetaMask enabled")
            this.web3 = new Web3(web3.currentProvider)
            this.isMetaMask = true
            this.accountProvider = new MetaMaskAccountProvider(this.web3)
        } else {
            console.log("No web3? You should consider trying MetaMask!")
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            // TODO use infura or another public node
            this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"))
            this.isMetaMask = false
            this.accountProvider = new WalletAccountProvider(this.web3)
        }
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
}

class WalletAccountProvider extends AccountProvider {
    constructor(web3) {
        super(web3)
    }

    refreshAccount() {
        return this.web3.eth.getTransactionCount(walletAddress)
            .then(nonce => {
                return { address: walletAddress, nonce: nonce }
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
        const privateKey = new Buffer(walletPrivateKey, 'hex')
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
}

export default new EtherDeltaWeb3()