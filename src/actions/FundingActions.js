import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"
import { tokEthToWei, tokWeiToEth, baseEthToWei, baseWeiToEth, safeBigNumber, weiToEth } from "../EtherConversion"
import TokenStore from "../stores/TokenStore"
import AccountStore from "../stores/AccountStore"
import FundingStore from "../stores/FundingStore"
import GasPriceStore from "../stores/GasPriceStore"
import * as AccountApi from "../apis/AccountApi"
import FundingModalType from "../components/Account/FundingModalType"
import FundingState from "../components/Account/FundingState"
import Config from "../Config"
import BigNumber from 'bignumber.js'

export function ethDepositAmountChanged(ethDepositAmountControlled) {
    const ethDepositAmountWei = baseEthToWei(ethDepositAmountControlled)
    ethDepositAmountWeiChanged(ethDepositAmountWei, ethDepositAmountControlled)
}

export function ethDepositAmountWeiChanged(ethDepositAmountWei, ethDepositAmountControlled = baseWeiToEth(ethDepositAmountWei)) {
    const walletBalanceEthWei = safeBigNumber(AccountStore.getAccountState().walletBalanceEthWei)
    const depositMaxFeeWei = safeBigNumber(GasPriceStore.getCurrentGasPriceWei()).times(safeBigNumber(Config.getGasLimit('deposit')))

    const remainingWalletBalanceWei = walletBalanceEthWei.minus(ethDepositAmountWei.plus(depositMaxFeeWei))
    const remainingWalletBalanceEth = baseWeiToEth(remainingWalletBalanceWei)
    let fundingState = FundingState.EMPTY
    let fundingText = ""
    if (!safeBigNumber(ethDepositAmountWei).isZero()) {
        if (remainingWalletBalanceWei.isGreaterThanOrEqualTo(BigNumber(0))) {

            const minRecommendedWalletGasWei = baseEthToWei(Config.getMinRecommendedWalletGasEth())
            if(remainingWalletBalanceWei.isLessThan(minRecommendedWalletGasWei)) {
                fundingState = FundingState.WARNING
                fundingText = `Deposit will leave ${remainingWalletBalanceEth.isZero() ? "0" : remainingWalletBalanceEth.toFixed(6)} ETH in your Wallet. We recommended you keep at least ${Config.getMinRecommendedWalletGasEth()} ETH in your Wallet to pay for Gas Fees.`
            } else {
                fundingState = FundingState.OK
            }

        } else {
            fundingState = FundingState.ERROR
            fundingText = `You cannot deposit more than your Wallet Balance minus Gas Fee (${baseWeiToEth(walletBalanceEthWei.minus(depositMaxFeeWei)).toFixed(6)} ETH)`
        }
    }

    dispatcher.dispatch({
        type: ActionNames.ETH_DEPOSIT_AMOUNT_CHANGED,
        ethDepositAmountControlled,
        ethDepositAmountWei,
        fundingState,
        fundingText
    })
}

export function ethDepositMaxAmount() {
    const walletBalanceEthWei = safeBigNumber(AccountStore.getAccountState().walletBalanceEthWei)
    const depositMaxFeeWei = safeBigNumber(GasPriceStore.getCurrentGasPriceWei()).times(safeBigNumber(Config.getGasLimit('deposit')))
    const maxDepositAmountWei = walletBalanceEthWei.minus(depositMaxFeeWei)

    if (maxDepositAmountWei.isGreaterThan(BigNumber(0))) {
        const minRecommendedWalletGasWei = baseEthToWei(Config.getMinRecommendedWalletGasEth())
        if(maxDepositAmountWei.isGreaterThan(minRecommendedWalletGasWei)) {
            ethDepositAmountWeiChanged(maxDepositAmountWei.minus(minRecommendedWalletGasWei))
        } else {
            ethDepositAmountWeiChanged(maxDepositAmountWei)
        }
    } else {
        ethDepositAmountWeiChanged(BigNumber(0), "")
    }
}

export function ethWithdrawalAmountChanged(ethWithdrawalAmountControlled) {
    const ethWithdrawalAmountWei = baseEthToWei(ethWithdrawalAmountControlled)
    ethWithdrawalAmountWeiChanged(ethWithdrawalAmountWei, ethWithdrawalAmountControlled)
}

export function ethWithdrawalAmountWeiChanged(ethWithdrawalAmountWei, ethWithdrawalAmountControlled = baseWeiToEth(ethWithdrawalAmountWei)) {
    const exchangeBalanceEthWei = safeBigNumber(AccountStore.getAccountState().exchangeBalanceEthWei)

    const remainingExchangeBalanceWei = exchangeBalanceEthWei.minus(ethWithdrawalAmountWei)
    const remainingExchangeBalanceEth = baseWeiToEth(exchangeBalanceEthWei)

    let fundingState = FundingState.EMPTY
    let fundingText = ""
    if (!safeBigNumber(ethWithdrawalAmountWei).isZero()) {
        if (remainingExchangeBalanceWei.isGreaterThanOrEqualTo(BigNumber(0))) {
            fundingState = FundingState.OK
        } else {
            fundingState = FundingState.ERROR
            fundingText = `You cannot withdraw more than your exchange ETH balance: ${baseWeiToEth(exchangeBalanceEthWei)}`
        }
    }

    dispatcher.dispatch({
        type: ActionNames.ETH_WITHDRAWAL_AMOUNT_CHANGED,
        ethWithdrawalAmountControlled,
        ethWithdrawalAmountWei,
        fundingState,
        fundingText
    })
}

export function ethWithdrawalMaxAmount() {
    const maxWithdrawalAmountWei = safeBigNumber(AccountStore.getAccountState().exchangeBalanceEthWei)

    if (maxWithdrawalAmountWei.isGreaterThan(BigNumber(0))) {
        ethWithdrawalAmountWeiChanged(maxWithdrawalAmountWei)
    } else {
        ethWithdrawalAmountWeiChanged(BigNumber(0), "")
    }
}

export function tokDepositAmountChanged(tokDepositAmountControlled) {
    const tokDepositAmountWei = tokEthToWei(tokDepositAmountControlled, TokenStore.getSelectedTokenAddress())
    tokDepositAmountWeiChanged(tokDepositAmountWei, tokDepositAmountControlled)
}

export function tokDepositAmountWeiChanged(tokDepositAmountWei, tokDepositAmountControlled = tokWeiToEth(tokDepositAmountWei, TokenStore.getSelectedTokenAddress())) {
    const walletBalanceTokWei = safeBigNumber(AccountStore.getAccountState().walletBalanceTokWei)
    const remainingWalletBalanceWei = walletBalanceTokWei.minus(tokDepositAmountWei)

    const tokenName = TokenStore.getSelectedToken().symbol

    let fundingState = FundingState.EMPTY
    let fundingText = ""
    if (!safeBigNumber(tokDepositAmountWei).isZero()) {
        if (remainingWalletBalanceWei.isGreaterThanOrEqualTo(BigNumber(0))) {
            fundingState = FundingState.OK
        } else {
            fundingState = FundingState.ERROR
            fundingText = `You cannot deposit more than your ${tokenName} wallet balance (${tokWeiToEth(walletBalanceTokWei, TokenStore.getSelectedTokenAddress())})`
        }
    }

    dispatcher.dispatch({
        type: ActionNames.TOK_DEPOSIT_AMOUNT_CHANGED,
        tokDepositAmountControlled,
        tokDepositAmountWei,
        fundingState,
        fundingText
    })
}

export function tokDepositMaxAmount() {
    const maxDepositAmountWei = safeBigNumber(AccountStore.getAccountState().walletBalanceTokWei)

    if (maxDepositAmountWei.isGreaterThan(BigNumber(0))) {
        tokDepositAmountWeiChanged(maxDepositAmountWei)
    } else {
        tokDepositAmountWeiChanged(BigNumber(0), "")
    }
}

export function tokWithdrawalAmountChanged(tokWithdrawalAmountControlled) {
    const tokWithdrawalAmountWei = tokEthToWei(tokWithdrawalAmountControlled, TokenStore.getSelectedTokenAddress())
    tokWithdrawalAmountWeiChanged(tokWithdrawalAmountWei, tokWithdrawalAmountControlled)
}

export function tokWithdrawalAmountWeiChanged(tokWithdrawalAmountWei, tokWithdrawalAmountControlled = tokWeiToEth(tokWithdrawalAmountWei, TokenStore.getSelectedTokenAddress())) {
    const exchangeBalanceTokWei = safeBigNumber(AccountStore.getAccountState().exchangeBalanceTokWei)
    const remainingExchangeBalanceWei = exchangeBalanceTokWei.minus(tokWithdrawalAmountWei)

    const tokenName = TokenStore.getSelectedToken().symbol

    let fundingState = FundingState.EMPTY
    let fundingText = ""
    if (!safeBigNumber(tokWithdrawalAmountWei).isZero()) {
        if (remainingExchangeBalanceWei.isGreaterThanOrEqualTo(BigNumber(0))) {
            fundingState = FundingState.OK
        } else {
            fundingState = FundingState.ERROR
            fundingText = `You cannot withdraw more than your exchange ${tokenName} balance: ${tokWeiToEth(exchangeBalanceTokWei, TokenStore.getSelectedTokenAddress())}`
        }
    }

    dispatcher.dispatch({
        type: ActionNames.TOK_WITHDRAWAL_AMOUNT_CHANGED,
        tokWithdrawalAmountControlled,
        tokWithdrawalAmountWei,
        fundingState,
        fundingText
    })
}

export function tokWithdrawMaxAmount() {
    const maxWithdrawalAmountWei = safeBigNumber(AccountStore.getAccountState().exchangeBalanceTokWei)

    if (maxWithdrawalAmountWei.isGreaterThan(BigNumber(0))) {
        tokWithdrawalAmountWeiChanged(maxWithdrawalAmountWei)
    } else {
        tokWithdrawalAmountWeiChanged(BigNumber(0), "")
    }
}

export function initiateFundingAction(modalType, modalText) {
    dispatcher.dispatch({
        type: ActionNames.INITIATE_FUNDING_ACTION,
        modalType,
        modalText
    })
}

export function abortFundingAction() {
    dispatcher.dispatch({
        type: ActionNames.ABORT_FUNDING_ACTION
    })
}

export function confirmFundingAction() {
    const { account, accountRetrieved, nonce } = AccountStore.getAccountState()
    switch (FundingStore.getFundingState().modalType) {
        case FundingModalType.ETH_DEPOSIT:
            AccountApi.depositEth(
                account,
                accountRetrieved,
                nonce,
                TokenStore.getSelectedTokenAddress(),
                FundingStore.getFundingState().ethDepositAmountWei,
                GasPriceStore.getCurrentGasPriceWei())
            break
        case FundingModalType.ETH_WITHDRAWAL:
            AccountApi.withdrawEth(
                account,
                accountRetrieved,
                nonce,
                TokenStore.getSelectedTokenAddress(),
                FundingStore.getFundingState().ethWithdrawalAmountWei,
                GasPriceStore.getCurrentGasPriceWei())
            break
        case FundingModalType.TOK_DEPOSIT:
            AccountApi.depositTok(
                account,
                accountRetrieved,
                nonce,
                TokenStore.getSelectedTokenAddress(),
                FundingStore.getFundingState().tokDepositAmountWei,
                GasPriceStore.getCurrentGasPriceWei())
            break
        case FundingModalType.TOK_WITHDRAWAL:
            AccountApi.withdrawTok(
                account,
                accountRetrieved,
                nonce,
                TokenStore.getSelectedTokenAddress(),
                FundingStore.getFundingState().tokWithdrawalAmountWei,
                GasPriceStore.getCurrentGasPriceWei())
            break
        default:
    }
    dispatcher.dispatch({
        type: ActionNames.CLEAR_FUNDING_ACTION
    })
}