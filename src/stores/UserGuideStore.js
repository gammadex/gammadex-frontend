import { EventEmitter } from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import UserGuideType from "../components/UserGuide/UserGuideType"

class UserGuideStore extends EventEmitter {
    constructor() {
        super()
        this.selectedUserGuideType = UserGuideType.CREATE_WALLET
    }

    getSelectedUserGuideType() {
        return this.selectedUserGuideType
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.SELECT_USER_GUIDE: {
                this.selectedUserGuideType = action.selectedUserGuideType
                this.emitChange()
                break
            }
        }
    }
}

const userGuideStore = new UserGuideStore()
dispatcher.register(userGuideStore.handleActions.bind(userGuideStore))

export default userGuideStore