
export default {
    WEB_SOCKET_CONSTRUCTED: "WEB_SOCKET_CONSTRUCTED",
    WEB_SOCKET_OPENED: "WEB_SOCKET_OPENED",
    WEB_SOCKET_CLOSED: "WEB_SOCKET_CLOSED",
    WEB_SOCKET_ERROR: "WEB_SOCKET_ERROR",
    WEB_SOCKET_CONNECT_ERROR: "WEB_SOCKET_CONNECT_ERROR",
    SELECT_TOKEN: "SELECT_TOKEN",
    ORDERS_RECEIVED: "ORDERS_RECEIVED",
    MESSAGE_REQUESTED_MARKET: "MESSAGE_REQUESTED_MARKET",
    MESSAGE_RECEIVED_MARKET: "MESSAGE_RECEIVED_MARKET",
    MESSAGE_RECEIVED_ORDERS: "MESSAGE_RECEIVED_ORDERS",
    MESSAGE_RECEIVED_MY_ORDERS: "MESSAGE_RECEIVED_MY_ORDERS",
    MESSAGE_RECEIVED_TRADES: "MESSAGE_RECEIVED_TRADES",
    MESSAGE_RECEIVED_FUNDS: "MESSAGE_RECEIVED_FUNDS",
    ACCOUNT_TYPE_RESOLVED: "ACCOUNT_TYPE_RESOLVED",
    RETRIEVING_ACCOUNT: "RETRIEVING_ACCOUNT",
    ACCOUNT_RETRIEVED: "ACCOUNT_RETRIEVED",
    RETRIEVING_BALANCE: "RETRIEVING_BALANCE",
    BALANCE_RETRIEVED: "BALANCE_RETRIEVED",
    BALANCE_RETRIEVAL_FAILED: "BALANCE_RETRIEVAL_FAILED",
    ETH_DEPOSIT_AMOUNT_CHANGED: "ETH_DEPOSIT_AMOUNT_CHANGED",
    TOK_DEPOSIT_AMOUNT_CHANGED: "TOK_DEPOSIT_AMOUNT_CHANGED",
    ETH_WITHDRAWAL_AMOUNT_CHANGED: "ETH_WITHDRAWAL_AMOUNT_CHANGED",
    TOK_WITHDRAWAL_AMOUNT_CHANGED: "TOK_WITHDRAWAL_AMOUNT_CHANGED",
    INITIATE_FUNDING_ACTION: "INITIATE_FUNDING_ACTION",
    ABORT_FUNDING_ACTION: "ABORT_FUNDING_ACTION",
    CLEAR_FUNDING_ACTION: "CLEAR_FUNDING_ACTION",
    ADD_PENDING_TRANSFER: "ADD_PENDING_TRANSFER",
    TRANSFER_SUCCEEDED: "TRANSFER_SUCCEEDED",
    TRANSFER_FAILED: "TRANSFER_FAILED",
    NONCE_UPDATED: "NONCE_UPDATED",
    WALLET_SELECTED: "WALLET_SELECTED",
    WALLET_CHANGE_KEYSTORE_FILE: "WALLET_CHANGE_KEYSTORE_FILE",
    WALLET_INVALID_KEYSTORE_FILE: "WALLET_INVALID_KEYSTORE_FILE",
    WALLET_CHANGE_KEYSTORE_PASSWORD: "WALLET_CHANGE_KEYSTORE_PASSWORD",
    WALLET_SAVED: "WALLET_SAVED",
    TOGGLE_ACCOUNT_POPOVER: "TOGGLE_ACCOUNT_POPOVER",
    FILL_ORDER: "FILL_ORDER",
    FILL_ORDER_CHANGED: "FILL_ORDER_CHANGED",
    CONFIRM_FILL_ORDER: "CONFIRM_FILL_ORDER",
    HIDE_FILL_ORDER_MODAL: "HIDE_FILL_ORDER_MODAL",
    REQUEST_ORDER_CANCEL: "REQUEST_ORDER_CANCEL",
    HIDE_CANCEL_ORDER_MODAL: "HIDE_CANCEL_ORDER_MODAL",
    ADD_PENDING_ORDER_CANCEL: "ADD_PENDING_ORDER_CANCEL",
    REMOVE_PENDING_ORDER_CANCEL: "REMOVE_PENDING_ORDER_CANCEL",
    OPEN_ORDERS_SHOW_ALL_CHANGED: "OPEN_ORDERS_SHOW_ALL_CHANGED",
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
    ACCOUNT_CREATED: "ACCOUNT_CREATED",
    NEW_ACCOUNT_SHOW_PRIVATE_KEY_UPDATED: "NEW_ACCOUNT_SHOW_PRIVATE_KEY_UPDATED",
    RESET_NEW_ACCOUNT_WORKFLOW: "RESET_NEW_ACCOUNT_WORKFLOW",
    WALLET_KEYSTORE_PASSWORD_ERROR: "WALLET_KEYSTORE_PASSWORD_ERROR",
    FOCUS_ON_ORDER_BOX: "FOCUS_ON_ORDER_BOX",
    FOCUS_ON_TRADE_BOX: "FOCUS_ON_TRADE_BOX",
    ORDER_BOX_TYPE_CHANGED: "ORDER_BOX_TYPE_CHANGED",
    ORDER_BOX_SIDE_CHANGED: "ORDER_BOX_SIDE_CHANGED",
    SELL_ORDER_PRICE_CHANGED: "SELL_ORDER_PRICE_CHANGED",
    SELL_ORDER_AMOUNT_CHANGED: "SELL_ORDER_AMOUNT_CHANGED",
    SELL_ORDER_TOTAL_CHANGED: "SELL_ORDER_TOTAL_CHANGED",
    SELL_ORDER_EXPIRY_CHANGED: "SELL_ORDER_EXPIRY_CHANGED",
    SELL_ORDER_PRICE_WARNING_DISMISSED: "SELL_ORDER_PRICE_WARNING_DISMISSED",
    CLEAR_SELL_ORDER: "CLEAR_SELL_ORDER",
    BUY_ORDER_PRICE_CHANGED: "BUY_ORDER_PRICE_CHANGED",
    BUY_ORDER_AMOUNT_CHANGED: "BUY_ORDER_AMOUNT_CHANGED",
    BUY_ORDER_TOTAL_CHANGED: "BUY_ORDER_TOTAL_CHANGED",
    BUY_ORDER_EXPIRY_CHANGED: "BUY_ORDER_EXPIRY_CHANGED",
    BUY_ORDER_PRICE_WARNING_DISMISSED: "BUY_ORDER_PRICE_WARNING_DISMISSED",
    CLEAR_BUY_ORDER: "CLEAR_BUY_ORDER",
    CLEAR_FILL_ORDER: "CLEAR_FILL_ORDER",
    WALLET_LOGOUT: "WALLET_LOGOUT",
    WALLET_UPDATE_PROVIDED_WEB3_AVAILABLE: "WALLET_UPDATE_PROVIDED_WEB3_AVAILABLE",
    WALLET_UPDATE_PROVIDED_WEB3_NET: "WALLET_UPDATE_PROVIDED_WEB3_NET",
    WALLET_UPDATE_PROVIDED_WEB3_ACCOUNT_AVAILABLE: "WALLET_UPDATE_PROVIDED_WEB3_ACCOUNT_AVAILABLE",
    WEB3_UPDATE_IS_CONNECTED: "WEB3_UPDATE_IS_CONNECTED",
    ADD_PENDING_TRADE: "ADD_PENDING_TRADE",
    MY_TRADE_STATUS_UPDATE: "MY_TRADE_STATUS_UPDATE",
    MY_TRADE_STATUS_UPDATE_FAILED: "MY_TRADE_STATUS_UPDATE_FAILED",
    MY_TRADE_STATUS_UPDATE_COMPLETED: "MY_TRADE_STATUS_UPDATE_COMPLETED",
    MY_TRADES_PURGED: "MY_TRADES_PURGED",
    TIMER_FIRED: "TIMER_FIRED",
    SEARCH_TOKEN: "SEARCH_TOKEN",
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
    GAS_PRICES_USE_CHEAPEST: "GAS_PRICES_USE_CHEAPEST",
    GAS_PRICES_USE_FASTEST: "GAS_PRICES_USE_FASTEST",
    ETHEREUM_PRICE_RETRIEVED: "ETHEREUM_PRICE_RETRIEVED",
    ETHEREUM_PRICE_ERROR: "ETHEREUM_PRICE_ERROR",
    UNLISTED_TOKEN_ADDRESS_LOOKUP: "UNLISTED_TOKEN_ADDRESS_LOOKUP",
    ADD_USER_TOKEN: "ADD_USER_TOKEN",
    REMOVE_USER_TOKEN: "REMOVE_USER_TOKEN",
    TRANSFERS_RECEIVED: "TRANSFERS_RECEIVED",
    RESET_CREATE_TOKEN: "RESET_CREATE_TOKEN",
    WEB3_INITIALISED: "WEB3_INITIALISED",
    GLOBAL_MESSAGE_SENT: "GLOBAL_MESSAGE_SENT",
    CLOSE_GLOBAL_MESSAGE: "CLOSE_GLOBAL_MESSAGE",
    CURRENT_BLOCK_NUMBER_UPDATED: "CURRENT_BLOCK_NUMBER_UPDATED",
    UNLISTED_TOKEN_ADDRESS_LOOKUP_ERROR: "UNLISTED_TOKEN_ADDRESS_LOOKUP_ERROR",
    UNLISTED_TOKEN_LOOKUP_LOOKUP_COMPLETE: "UNLISTED_TOKEN_LOOKUP_LOOKUP_COMPLETE",
    UNLISTED_TOKEN_CHECK_ERROR: "UNLISTED_TOKEN_CHECK_ERROR",
    UNRECOGNISED_TOKEN_ADDRESS_LOOKUP: "UNRECOGNISED_TOKEN_ADDRESS_LOOKUP",
    UNRECOGNISED_TOKEN_LOOKUP_LOOKUP_COMPLETE: "UNRECOGNISED_TOKEN_LOOKUP_LOOKUP_COMPLETE",
    UNRECOGNISED_TOKEN_CHECK_ERROR: "UNRECOGNISED_TOKEN_CHECK_ERROR",
    INVALID_TOKEN_IDENTIFIER_IN_URL: "INVALID_TOKEN_IDENTIFIER_IN_URL",
    METAMASK_NETWORK_WARNING_SENT: "METAMASK_NETWORK_WARNING_SENT"
}