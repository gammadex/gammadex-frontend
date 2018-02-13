import abiEtherDelta from './config/etherdelta.json'
import abiToken from './config/token.json'
import * as Web3 from 'web3'
let web3 = window.web3

const ethAddress = "0x0000000000000000000000000000000000000000"
const etherDeltaAddress = "0x228344536a03c0910fb8be9c2755c1a0ba6f89e1"
const gasLimit = 250000
const gasPrice = 10 * 1000000000

// https://ethereum.stackexchange.com/questions/11444/web3-js-with-promisified-api/24238#24238
const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) { reject(err) }
            resolve(res)
        })
    )

class EtherDeltaWeb3 {
    constructor() {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== "undefined") {
            // Use Mist/MetaMask's provider
            // TODO check whether current metamask is locked
            window.web3 = new Web3(web3.currentProvider)
            console.log("MetaMask enabled")
        } else {
            console.log("No web3? You should consider trying MetaMask!")
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            // TODO use infura or another public node
            window.web3 = new Web3(
                new Web3.providers.HttpProvider("https://localhost:8545")
            )
        }

        this.contractToken = web3.eth.contract(abiToken)
        this.contractEtherDelta = web3.eth.contract(abiEtherDelta).at(etherDeltaAddress)
    }

    refreshAccount() {
        return promisify(cb => web3.eth.getAccounts(cb))
            .then(accounts => {
                if (accounts.length > 0) {
                    return accounts[0]
                } else {
                    throw new Error("no addresses found")
                }
            })
    }

    refreshEthAndTokBalance(account, tokenAddress) {
        return Promise.all([
            promisify(cb => web3.eth.getBalance(account, cb)),
            promisify(cb => this.contractToken.at(tokenAddress).balanceOf(account, cb)),
            promisify(cb => this.contractEtherDelta.balanceOf(ethAddress, account, cb)),
            promisify(cb => this.contractEtherDelta.balanceOf(tokenAddress, account, cb))
        ])
    }

    promiseDepositEther(amount) {
        return promisify(cb => this.contractEtherDelta.deposit({ gas: gasLimit, gasPrice: gasPrice, value: amount }, cb))
    }
    
    promiseWithdrawEther(amount) {
        return promisify(cb => this.contractEtherDelta.withdraw(amount, { gas: gasLimit, gasPrice: gasPrice }, cb))
    }
    
    promiseDepositToken(tokenAddress, amount) {
        // deposit an ERC-20 token is two step:
        // 1) call the token contract to approve the transfer to the destination address = ED
        // 2) initiate the transfer in the ED smart contract
        return Promise.all([
            promisify(cb => this.contractToken.at(tokenAddress).approve(etherDeltaAddress, amount, { gas: gasLimit, gasPrice: gasPrice }, cb)),
            promisify(cb => this.contractEtherDelta.depositToken(tokenAddress, amount, { gas: gasLimit, gasPrice: gasPrice }, cb))
        ])
    }
    
    promiseWithdrawToken(tokenAddress, amount) {
        return promisify(cb => this.contractEtherDelta.withdrawToken(tokenAddress, amount, { gas: gasLimit, gasPrice: gasPrice }, cb))
    }
}

export default new EtherDeltaWeb3()