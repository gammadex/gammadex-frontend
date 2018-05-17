import React from 'react'
import GlobalMessageStore from "../stores/GlobalMessageStore"
import _ from "lodash"
import * as GlobalMessageActions from "../actions/GlobalMessageActions"
import Date from "./CustomComponents/Date"

class GlobalMessages extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            messages: GlobalMessageStore.getMessagesSortedByTime()
        }

        this.onGlobalMessageStoreChange = this.onGlobalMessageStoreChange.bind(this)
    }

    componentWillMount() {
        GlobalMessageStore.on("change", this.onGlobalMessageStoreChange)
    }

    componentWillUnmount() {
        GlobalMessageStore.removeListener("change", this.onGlobalMessageStoreChange)
    }

    onGlobalMessageStoreChange() {
        this.setState({
            messages: GlobalMessageStore.getMessagesSortedByTime()
        })
    }

    closeMessage = (id) => {
        GlobalMessageActions.closeGlobalMessage(id)
    }

    render() {
        const {messages} = this.state

        const messageList = _.map(messages, message => {
            const {id, alertType, content, time} = message

            return (
                <div key={id} className={"alert alert-" + alertType + " border-" + alertType + " global-message"}>
                    <div className="row">
                        <div className="col-lg-11">
                            {content}
                        </div>
                        <div className="col-lg-1">
                            <button type="button" className="close float-right"
                                    onClick={() => this.closeMessage(id)}>
                                <span aria-hidden="true"><i className="far fa-times-circle"/></span>
                            </button>
                        </div>
                    </div>
                    <small><i><Date year>{time.toString()}</Date></i></small>
                </div>
            )
        })

        return (
            <div className="global-messages">
                {messageList}
            </div>
        )
    }
}

export default GlobalMessages