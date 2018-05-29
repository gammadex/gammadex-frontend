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
            const tradeMaxFeeWei = safeBigNumber(GasPriceStore.getCurrentGasPriceWei()).times(safeBigNumber(Config.getGasLimit('trade')))
            const remaining = `${remainingWalletBalanceEth} ETH remaining after this deposit + max gas fee.`
            const numberOfTrades = remainingWalletBalanceWei.div(tradeMaxFeeWei).dp(0, BigNumber.ROUND_FLOOR)
            if (numberOfTrades.isZero()) {
                fundingState = FundingState.WARNING
                fundingText = `${remaining} This leaves insufficient gas to submit additional Trade transactions.`
            } else if (numberOfTrades.isGreaterThan(BigNumber(20))) {
                fundingState = FundingState.OK
                fundingText = `${remaining} This is sufficient gas for > 20 Trades`
            } else {
                fundingState = FundingState.OK
                fundingText = `${remaining} This is sufficient gas for approximately ${numberOfTrades.toFixed(0)} Trades`
            }

        } else {
            fundingState = FundingState.ERROR
            fundingText = "Your wallet has an insufficient ETH balance for this deposit"
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
        ethDepositAmountWeiChanged(maxDepositAmountWei)
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
            fundingText = `Your ETH exchange balance is sufficient for this withdrawal`
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

    const tokenName = TokenStore.getSelectedToken().name

    let fundingState = FundingState.EMPTY
    let fundingText = ""
    if (!safeBigNumber(tokDepositAmountWei).isZero()) {
        if (remainingWalletBalanceWei.isGreaterThanOrEqualTo(BigNumber(0))) {
            fundingState = FundingState.OK
        } else {
            fundingState = FundingState.ERROR
            fundingText = `Your wallet has an insufficient ${tokenName} balance for this deposit`
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

    const tokenName = TokenStore.getSelectedToken().name

    let fundingState = FundingState.EMPTY
    let fundingText = ""
    if (!safeBigNumber(tokWithdrawalAmountWei).isZero()) {
        if (remainingExchangeBalanceWei.isGreaterThanOrEqualTo(BigNumber(0))) {
            fundingState = FundingState.OK
        } else {
            fundingState = FundingState.ERROR
            fundingText = `Your ${tokenName} exchange balance is insufficient for this withdrawal`
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