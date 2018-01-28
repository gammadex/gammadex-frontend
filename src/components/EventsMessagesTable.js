import React from "react"
import EventMessage from './EventMessage'

export default class EventsMessagesTable extends React.Component {
    constructor() {
        super()
        this.state = {
            eventMessages: []
        }
    }

    render() {
        const eventMessageRows = this.state.eventMessages.map((eventMessage) => {
            return <EventMessage key={eventMessage.id} {...eventMessage}/>;
        });

        return (
            <div>
                <div className="row">
                    <div className="col-lg-12">
                        <h3>Events</h3>
                        <table id="events" className="table table-striped">
                            <tbody>
                            {eventMessageRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
