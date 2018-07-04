import Config from '../Config'
import abiEtherDelta from '../config/etherdelta.json'
import etherDeltaBytecode from '../config/etherdeltabytecode.json'
import abiTestToken from '../config/testtoken.json'
import testTokenBytecode from '../config/testtokenbytecode.json'
import BigNumber from 'bignumber.js'

// ESLint
/* global global */

export function deployContracts(web3, metamaskAddress, feeAccount, primaryKeyAccount, defaultGasPrice) {
    /**
     * Deploy EtherDelta smart contract to ganache, capturing the contract instance globally
     * and shoe-horn that (dynamic) address into our test configuration
     */

    const edContract = new web3.eth.Contract(abiEtherDelta)
    const promiseDeployEdContract = () => {
        return edContract.deploy({
            data: etherDeltaBytecode.data,
            arguments: [metamaskAddress, feeAccount.address, "0x0", 0, 3000000000000000, 0]
        }).send({
            from: metamaskAddress,
            gas: 3000000,
            gasPrice: defaultGasPrice
        }).then(newContractInstance => {
            global.edContractInstance = newContractInstance
            Config.getEnv().etherDeltaAddress = newContractInstance.options.address
        })
    }

    /**
     * Deploy ERC-20 Test Token to ganache. The contract by default gives the owner (metamask) account 100 TEST
     */
    const testTokenContract = new web3.eth.Contract(abiTestToken)
    const promiseDeployTestTokenContract = (weiAmount) => {
        return testTokenContract.deploy({
            data: testTokenBytecode.data
        }).send({
            from: metamaskAddress,
            gas: 4700000,
            gasPrice: defaultGasPrice
        }).then(newContractInstance => {
            // Transfer 20 TEST from the metamask to the private key account
            return newContractInstance.methods.transfer(primaryKeyAccount.address, weiAmount)
                .send({
                    from: metamaskAddress,
                    gas: 200000,
                    gasPrice: defaultGasPrice
                })
                .then(() => {
                    return newContractInstance
                })
        })
    }

    // Transfer 10 ETH from the metamask to the private key account
    const promiseTopupWalletEth = () => {
        return web3.eth.sendTransaction({
            from: metamaskAddress,
            to: primaryKeyAccount.address,
            value: web3.utils.toWei('10', 'ether')
        })
    }

    return promiseDeployEdContract()
        .then(() => {
            return promiseTopupWalletEth()
        })
        .then(() => {
            return promiseDeployTestTokenContract(web3.utils.toWei('20', 'ether'))
                .then(newContractInstance => {
                    global.testTokenContractInstance = newContractInstance
                })
        })
        .then(() => {
            return promiseDeployTestTokenContract(BigNumber('20').times(BigNumber(10 ** 9)).toString())
                .then(newContractInstance => {
                    global.testTokenContractInstanceNineDecimals = newContractInstance
                })
        })        
}