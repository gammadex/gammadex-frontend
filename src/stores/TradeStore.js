import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import { isTakerBuy } from "../OrderUtil"
import OrderSide from "../OrderSide"
import OrderEntryField from "../OrderEntryField"
import { isNull } from "util";
import { isNullOrUndefined } from "util";

class TradeStore extends EventEmitter {
    constructor() {
        super()
        this.fillAmountInvalidReason = ""
        this.fillAmountInvalidField = OrderEntryField.AMOUNT
        this.fillOrderTakerBuy = null,
        this.fillOrderTakerSell = null
    }

    getTradeState() {
        return {
            fillOrderTakerBuy: this.fillOrderTakerBuy,
            fillOrderTakerSell: this.fillOrderTakerSell
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.FILL_ORDER: {
                if(isTakerBuy(action.fillOrder.order)) {
                    this.fillOrderTakerBuy = action.fillOrder
                } else {
                    this.fillOrderTakerSell = action.fillOrder
                }
                this.emitChange()
                break
            }
            case ActionNames.CLEAR_FILL_ORDER: {
                if(action.takerSide === OrderSide.BUY) {
                    this.fillOrderTakerBuy = null
                } else {
                    this.fillOrderTakerSell = null                
                }
                this.emitChange()
                break
            }
            case ActionNames.FILL_ORDER_CHANGED: {
                if(isTakerBuy(action.updatedFillOrder.order)) {
                    this.fillOrderTakerBuy = action.updatedFillOrder
                } else {
                    this.fillOrderTakerSell = action.updatedFillOrder
                }
                this.emitChange()
                break
            }         
        }
    }
}

const tradeStore = new TradeStore()
dispatcher.register(tradeStore.handleActions.bind(tradeStore))

export default tradeStore