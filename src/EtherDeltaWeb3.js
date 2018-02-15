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
        } else {
            console.log("No web3? You should consider trying MetaMask!")
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            // TODO use infura or another public node
            this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"))
            this.isMetaMask = false
        }
        this.contractToken = new this.web3.eth.Contract(abiToken)
        this.contractEtherDelta = new this.web3.eth.Contract(abiEtherDelta)
        this.contractEtherDelta.options.address = etherDeltaAddress
    }

    getIsMetaMask() {
        return this.isMetaMask
    }

    refreshAccount() {
        if (this.isMetaMask) {
            return this.web3.eth.getAccounts()
                .then(accounts => {
                    if (accounts.length > 0) {
                        return accounts[0]
                    } else {
                        throw new Error("no addresses found")
                    }
                })
        } else {
            return Promise.resolve(walletAddress)
        }
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

    promiseDepositEther(account, amount) {
        if (this.isMetaMask) {
            return this.contractEtherDelta.methods.deposit()
                .send({ from: account, gas: gasLimit, gasPrice: gasPrice, value: amount })
        } else {
            return this.web3.eth.getTransactionCount(account)
                .then(nonce => {
                    const rawTx = {
                        nonce: this.web3.utils.numberToHex(nonce),
                        gasPrice: this.web3.utils.numberToHex(gasPrice),
                        gasLimit: this.web3.utils.numberToHex(gasLimit),
                        to: etherDeltaAddress,
                        value: this.web3.utils.numberToHex(amount),
                        data: this.contractEtherDelta.methods.deposit().encodeABI()
                    }
                    let tx = new Tx(rawTx);
                    const privateKey = new Buffer(walletPrivateKey, 'hex')
                    tx.sign(privateKey);
                    return this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                })
        }
    }

    promiseWithdrawEther(account, amount) {
        return this.contractEtherDelta.methods.withdraw(amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseTokenApprove(account, tokenAddress, amount) {
        this.contractToken.options.address = tokenAddress
        return this.contractToken.methods.approve(etherDeltaAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseDepositToken(account, tokenAddress, amount) {
        this.promiseTokenApprove(account, tokenAddress, amount)
            .on('error', error => { console.log(`failed to approve token deposit: ${error.message}`) })
        return this.contractEtherDelta.methods.depositToken(tokenAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }

    promiseWithdrawToken(account, tokenAddress, amount) {
        return this.contractEtherDelta.methods.withdrawToken(tokenAddress, amount)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice })
    }
}

export default new EtherDeltaWeb3()