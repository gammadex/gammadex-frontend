import BigNumber from 'bignumber.js'
import Config from "./Config"
import TokenRepository from "./util/TokenRepository"

export function safeBigNumber(num) {
    if(num == null) {
        return BigNumber(0)
    } else {
        const strNum = String(num)
        return BigNumber(strNum === "" ? "0" : strNum)
    }
}

export function weiToEth(wei, decimals) {
    return safeBigNumber(wei).div(BigNumber(10 ** decimals))
}

export function ethToWei(eth, decimals) {
    return safeBigNumber(eth).times(BigNumber(10 ** decimals)).dp(0, BigNumber.ROUND_FLOOR)
}

export function baseWeiToEth(wei) {
    return weiToEth(wei, Config.getBaseDecimals())
}

export function baseEthToWei(eth) {
    return ethToWei(eth, Config.getBaseDecimals())
}

export function tokWeiToEth(wei, tokenAddress) {
    return weiToEth(wei, TokenRepository.getTokenDecimalsByAddress(tokenAddress))
}

export function tokEthToWei(eth, tokenAddress) {
    return ethToWei(eth, TokenRepository.getTokenDecimalsByAddress(tokenAddress))
}

export function weiToGwei(wei) {
    return safeBigNumber(wei).div(BigNumber(1000000000))
}

export function gweiToWei(gwei) {
    return safeBigNumber(gwei).times(BigNumber(1000000000))
}

export function gweiToEth(gwei) {
    return safeBigNumber(gwei).div(BigNumber(1000000000))
}