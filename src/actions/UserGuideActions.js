import dispatcher from "../dispatcher"
import ActionNames from "./ActionNames"

export function selectUserGuide(selectedUserGuideType) {
    dispatcher.dispatch({
        type: ActionNames.SELECT_USER_GUIDE,
        selectedUserGuideType: selectedUserGuideType
    })
}