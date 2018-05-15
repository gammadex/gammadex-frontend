
export default {
    WEB_SOCKET_CONSTRUCTED: "WEB_SOCKET_CONSTRUCTED",
    WEB_SOCKET_OPENED: "WEB_SOCKET_OPENED",
    WEB_SOCKET_CLOSED: "WEB_SOCKET_CLOSED",
    WEB_SOCKET_ERROR: "WEB_SOCKET_ERROR",
    WEB_SOCKET_CONNECT_ERROR: "WEB_SOCKET_CONNECT_ERROR",
    SELECT_TOKEN: "SELECT_TOKEN",
    ORDERS_RECEIVED: "ORDERS_RECEIVED",
    MESSAGE_RECEIVED_MARKET: "MESSAGE_RECEIVED_MARKET",
    MESSAGE_RECEIVED_ORDERS: "MESSAGE_RECEIVED_ORDERS",
    MESSAGE_RECEIVED_TRADES: "MESSAGE_RECEIVED_TRADES",
    MESSAGE_RECEIVED_FUNDS: "MESSAGE_RECEIVED_FUNDS",
    CHANGE_BIDS_PAGE: "CHANGE_BIDS_PAGE",
    CHANGE_OFFERS_PAGE: "CHANGE_OFFERS_PAGE",
    CHANGE_TRADES_PAGE: "CHANGE_TRADES_PAGE",
    ACCOUNT_TYPE_RESOLVED: "ACCOUNT_TYPE_RESOLVED",
    ACCOUNT_RETRIEVED: "ACCOUNT_RETRIEVED",    
    BALANCE_RETRIEVED: "BALANCE_RETRIEVED",
    BALANCE_RETRIEVAL_FAILED: "BALANCE_RETRIEVAL_FAILED",
    DEPOSIT_WITHDRAW: "DEPOSIT_WITHDRAW",
    DEPOSIT_WITHDRAW_CANCEL: "DEPOSIT_WITHDRAW_CANCEL",
    DEPOSIT_WITHDRAW_AMOUNT_UPDATED: "DEPOSIT_WITHDRAW_AMOUNT_UPDATED",
    ADD_PENDING_TRANSFER: "ADD_PENDING_TRANSFER",
    TRANSFER_SUCCEEDED: "TRANSFER_SUCCEEDED",
    TRANSFER_FAILED: "TRANSFER_FAILED",
    NONCE_UPDATED: "NONCE_UPDATED",
    WALLET_SELECTED: "WALLET_SELECTED",
    WALLET_CHANGE_KEYSTORE_FILE: "WALLET_CHANGE_KEYSTORE_FILE",
    WALLET_INVALID_KEYSTORE_FILE: "WALLET_INVALID_KEYSTORE_FILE",
    WALLET_CHANGE_KEYSTORE_PASSWORD: "WALLET_CHANGE_KEYSTORE_PASSWORD",
    WALLET_SAVED: "WALLET_SAVED",
    EXECUTE_TRADE: "EXECUTE_TRADE",
    EXECUTE_TRADE_ABORTED: "EXECUTE_TRADE_ABORTED",
    FILL_AMOUNT_CHANGED: "FILL_AMOUNT_CHANGED",
    FILL_ORDER: "FILL_ORDER",
    FILL_ORDER_CHANGED: "FILL_ORDER_CHANGED",
    WALLET_TYPE_SELECTED: "WALLET_TYPE_SELECTED",
    WALLET_SELECTED_KEYSTORE_FILE: "WALLET_SELECTED_KEYSTORE_FILE",
    ACCOUNT_REFRESH_ERROR: "ACCOUNT_REFRESH_ERROR",
    WALLET_PASSWORD_ERROR: "WALLET_PASSWORD_ERROR",
    WALLET_CHANGE_REMEMBER_KEYSTORE: "WALLET_CHANGE_REMEMBER_KEYSTORE",
    WALLET_CHANGE_REMEMBER_METAMASK: "WALLET_CHANGE_REMEMBER_METAMASK",
    WALLET_HIDE_UNLOCK_KEYSTORE_MODAL: "WALLET_HIDE_UNLOCK_KEYSTORE_MODAL",
    WALLET_CHANGE_REMEMBER_PRIVATE_KEY: "WALLET_CHANGE_REMEMBER_PRIVATE_KEY",
    WALLET_HIDE_UNLOCK_PRIVATE_KEY_MODAL: "WALLET_HIDE_UNLOCK_PRIVATE_KEY_MODAL",
    WALLET_CHANGE_PRIVATE_KEY_UNLOCK_PASSWORD: "WALLET_CHANGE_PRIVATE_KEY_UNLOCK_PASSWORD",
    WALLET_CHANGE_PRIVATE_KEY_PASSWORDS: "WALLET_CHANGE_PRIVATE_KEY_PASSWORDS",
    WALLET_CHANGE_USE_PRIVATE_KEY_ENCRYPTION: "WALLET_CHANGE_USE_PRIVATE_KEY_ENCRYPTION",
    WALLET_KEYSTORE_PASSWORD_ERROR: "WALLET_KEYSTORE_PASSWORD_ERROR",
    SELL_ORDER_TYPE_CHANGED: "SELL_ORDER_TYPE_CHANGED",
    SELL_ORDER_PRICE_CHANGED: "SELL_ORDER_PRICE_CHANGED",
    SELL_ORDER_AMOUNT_CHANGED: "SELL_ORDER_AMOUNT_CHANGED",
    SELL_ORDER_TOTAL_CHANGED: "SELL_ORDER_TOTAL_CHANGED",
    SELL_ORDER_EXPIRY_CHANGED: "SELL_ORDER_EXPIRY_CHANGED",
    SELL_ORDER_PRICE_WARNING_DISMISSED: "SELL_ORDER_PRICE_WARNING_DISMISSED",
    BUY_ORDER_TYPE_CHANGED: "BUY_ORDER_TYPE_CHANGED",
    BUY_ORDER_PRICE_CHANGED: "BUY_ORDER_PRICE_CHANGED",
    BUY_ORDER_AMOUNT_CHANGED: "BUY_ORDER_AMOUNT_CHANGED",
    BUY_ORDER_TOTAL_CHANGED: "BUY_ORDER_TOTAL_CHANGED",
    BUY_ORDER_EXPIRY_CHANGED: "BUY_ORDER_EXPIRY_CHANGED",
    BUY_ORDER_PRICE_WARNING_DISMISSED: "BUY_ORDER_PRICE_WARNING_DISMISSED",    
    EXECUTE_TRADES: "EXECUTE_TRADES",
    HIDE_EXECUTE_TRADES_MODAL: "HIDE_EXECUTE_TRADES_MODAL",
    CREATE_ORDER: "CREATE_ORDER",
    HIDE_CREATE_ORDER_MODAL: "HIDE_CREATE_ORDER_MODAL",
    SENT_TRANSACTION: "SENT_TRANSACTION",
    SEND_TRANSACTION_FAILED: "SEND_TRANSACTION_FAILED",
    HIDE_TRANSACTION_MODAL: "HIDE_TRANSACTION_MODAL",
    DISMISS_TRANSACTION_ALERT: "DISMISS_TRANSACTION_ALERT",
    CLEAR_FILL_ORDER: "CLEAR_FILL_ORDER",
    WALLET_LOGOUT: "WALLET_LOGOUT",
    WALLET_UPDATE_PROVIDED_WEB3_AVAILABLE: "WALLET_UPDATE_PROVIDED_WEB3_AVAILABLE",
    WALLET_UPDATE_PROVIDED_WEB3_NET: "WALLET_UPDATE_PROVIDED_WEB3_NET",
    WALLET_UPDATE_PROVIDED_WEB3_ACCOUNT_AVAILABLE: "WALLET_UPDATE_PROVIDED_WEB3_ACCOUNT_AVAILABLE",
    ADD_PENDING_TRADE: "ADD_PENDING_TRADE",
    MY_TRADE_STATUS_UPDATE: "MY_TRADE_STATUS_UPDATE",
    MY_TRADE_STATUS_UPDATE_FAILED: "MY_TRADE_STATUS_UPDATE_FAILED",
    MY_TRADE_STATUS_UPDATE_COMPLETED: "MY_TRADE_STATUS_UPDATE_COMPLETED",
    MY_TRADES_PURGED: "MY_TRADES_PURGED",
    TIMER_FIRED: "TIMER_FIRED",
    SEARCH_TOKEN: "SEARCH_TOKEN",
    ADD_OPEN_ORDER: "ADD_OPEN_ORDER",
    CANCEL_OPEN_ORDER: "CANCEL_OPEN_ORDER",
    CANCEL_OPEN_ORDER_SUCCEEDED: "CANCEL_OPEN_ORDER_SUCCEEDED",
    CANCEL_OPEN_ORDER_FAILED: "CANCEL_OPEN_ORDER_FAILED",
    OPEN_ORDERS_PURGED: "OPEN_ORDERS_PURGED",
    INVALID_TOKEN: "INVALID_TOKEN",
    WALLET_LEDGER_ERROR: "WALLET_LEDGER_ERROR",
    WALLET_LEDGER_ACCOUNTS_RETRIEVED: "WALLET_LEDGER_ACCOUNTS_RETRIEVED",
    WALLET_LEDGER_ACCOUNTS_REQUESTED: "WALLET_LEDGER_ACCOUNTS_REQUESTED",
    WALLET_SELECT_DERIVATION_PATH_SOURCE: "WALLET_SELECT_DERIVATION_PATH_SOURCE",
    WALLET_LEDGER_DERIVATION_PATH_SOURCE_SELECTED: "WALLET_LEDGER_DERIVATION_PATH_SOURCE_SELECTED",
    WALLET_LEDGER_CHANGE_ADDRESS_PAGE: "WALLET_LEDGER_CHANGE_ADDRESS_PAGE",
    WALLET_LEDGER_CHANGE_ADDRESS_OFFSET: "WALLET_LEDGER_CHANGE_ADDRESS_OFFSET",
    WALLET_LEDGER_CHANGE_CUSTOM_DERIVATION_PATH: "WALLET_LEDGER_CHANGE_CUSTOM_DERIVATION_PATH",
    GAS_PRICES_RETRIEVED: "GAS_PRICES_RETRIEVED",
    GAS_PRICES_RETRIEVE_ERROR: "GAS_PRICES_RETRIEVE_ERROR",
    GAS_PRICES_SET_CURRENT_PRICE_WEI: "GAS_PRICES_SET_CURRENT_PRICE_WEI",
    GAS_PRICES_USE_RECOMMENDED: "GAS_PRICES_USE_RECOMMENDED",
    ETHEREUM_PRICE_RETRIEVED: "ETHEREUM_PRICE_RETRIEVED",
    ETHEREUM_PRICE_ERROR: "ETHEREUM_PRICE_ERROR",
    TOKEN_ADDRESS_LOOKUP_START: "TOKEN_ADDRESS_LOOKUP",
    ADD_USER_TOKEN: "ADD_USER_TOKEN",
    REMOVE_USER_TOKEN: "REMOVE_USER_TOKEN",
    TRANSFERS_RECEIVED: "TRANSFERS_RECEIVED",
    RESET_CREATE_TOKEN: "RESET_CREATE_TOKEN"
}