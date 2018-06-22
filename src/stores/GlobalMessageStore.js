import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import _ from "lodash"

class GlobalMessageStore extends EventEmitter {
    constructor() {
        super()
        this.messages = []
    }

    getMessagesSortedByTime() {
        return _.reverse(_.sortBy(this.messages,  ['time']))
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.GLOBAL_MESSAGE_SENT: {
                const {type, ...message} = action
                this.messages.push(message)
                this.emitChange()
                break
            }
            case ActionNames.CLOSE_GLOBAL_MESSAGE: {
                this.messages = this.messages.filter(m => m.id !== action.id)
                this.emitChange()
                break
            }
        }
    }
}

const blobalMessageStore = new GlobalMessageStore()
dispatcher.register(blobalMessageStore.handleActions.bind(blobalMessageStore))

export default blobalMessageStore