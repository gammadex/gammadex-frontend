import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectWallet(walletType) {
    dispatcher.dispatch({
        type: ActionNames.WALLET_SELECTED,
        walletType
    })
}
