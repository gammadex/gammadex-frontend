import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import BigNumber from 'bignumber.js'
import FundingModalType from "../components/Account/FundingModalType"
import FundingState from "../components/Account/FundingState"

class FundingStore extends EventEmitter {
    constructor() {
        super()
        this.clearState = this.clearState.bind(this)
        this.clearState()
    }

    clearState() {
        this.ethDepositAmountControlled = ""
        this.ethDepositAmountWei = BigNumber(0)
        this.ethDepositState = FundingState.EMPTY
        this.ethDepositText = ""
        this.ethWithdrawalAmountControlled = ""
        this.ethWithdrawalAmountWei = BigNumber(0)
        this.ethWithdrawalState = FundingState.EMPTY
        this.ethWithdrawalText = ""        
        this.tokDepositAmountControlled = ""
        this.tokDepositAmountWei = BigNumber(0)
        this.tokDepositState = FundingState.EMPTY
        this.tokDepositText = ""
        this.tokWithdrawalAmountControlled = ""
        this.tokWithdrawalAmountWei = BigNumber(0)
        this.tokWithdrawalState = FundingState.EMPTY
        this.tokWithdrawalText = ""          
        this.modalType = FundingModalType.NO_MODAL
        this.modalText = ""
    }

    getFundingState() {
        return {
            ethDepositAmountControlled: this.ethDepositAmountControlled,
            ethDepositAmountWei: this.ethDepositAmountWei,
            tokDepositAmountControlled: this.tokDepositAmountControlled,
            tokDepositAmountWei: this.tokDepositAmountWei,
            ethWithdrawalAmountControlled: this.ethWithdrawalAmountControlled,
            ethWithdrawalAmountWei: this.ethWithdrawalAmountWei,
            tokWithdrawalAmountControlled: this.tokWithdrawalAmountControlled,
            tokWithdrawalAmountWei: this.tokWithdrawalAmountWei,
            modalType: this.modalType,
            modalText: this.modalText,
            ethDepositState: this.ethDepositState,
            ethDepositText: this.ethDepositText,
            tokDepositState: this.tokDepositState,
            tokDepositText: this.tokDepositText,
            ethWithdrawalState: this.ethWithdrawalState,
            ethWithdrawalText: this.ethWithdrawalText,
            tokWithdrawalState: this.tokWithdrawalState,
            tokWithdrawalText: this.tokWithdrawalText,
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.ETH_DEPOSIT_AMOUNT_CHANGED: {
                this.ethDepositAmountControlled = action.ethDepositAmountControlled
                this.ethDepositAmountWei = action.ethDepositAmountWei
                this.ethDepositState = action.fundingState
                this.ethDepositText = action.fundingText
                this.emitChange()
                break
            } 
            case ActionNames.TOK_DEPOSIT_AMOUNT_CHANGED: {
                this.tokDepositAmountControlled = action.tokDepositAmountControlled
                this.tokDepositAmountWei = action.tokDepositAmountWei
                this.tokDepositState = action.fundingState
                this.tokDepositText = action.fundingText
                this.emitChange()
                break
            }    
            case ActionNames.ETH_WITHDRAWAL_AMOUNT_CHANGED: {
                this.ethWithdrawalAmountControlled = action.ethWithdrawalAmountControlled
                this.ethWithdrawalAmountWei = action.ethWithdrawalAmountWei
                this.ethWithdrawalState = action.fundingState
                this.ethWithdrawalText = action.fundingText
                this.emitChange()
                break
            } 
            case ActionNames.TOK_WITHDRAWAL_AMOUNT_CHANGED: {
                this.tokWithdrawalAmountControlled = action.tokWithdrawalAmountControlled
                this.tokWithdrawalAmountWei = action.tokWithdrawalAmountWei
                this.tokWithdrawalState = action.fundingState
                this.tokWithdrawalText = action.fundingText
                this.emitChange()
                break
            }                        
            case ActionNames.INITIATE_FUNDING_ACTION: {
                this.modalType = action.modalType
                this.modalText = action.modalText
                this.emitChange()
                break
            } 
            case ActionNames.ABORT_FUNDING_ACTION: {
                this.modalType = FundingModalType.NO_MODAL
                this.modalText = ""
                this.emitChange()
                break
            }   
            case ActionNames.CLEAR_FUNDING_ACTION: {
                this.clearState()                           
                this.emitChange()
                break
            }     
            case ActionNames.SELECT_TOKEN: {
                this.clearState()                           
                this.emitChange()
                break
            }                                                        
        }
    }
}

const fundingStore = new FundingStore()
dispatcher.register(fundingStore.handleActions.bind(fundingStore))

export default fundingStore