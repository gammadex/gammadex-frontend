import * as StatsActions from "../actions/StatsActions"
import EtherDeltaWebSocket from "../EtherDeltaSocket"
import * as TokenBalancesActions from "../actions/TokenBalancesActions"
import datejs from 'datejs'

const RequestReason = {
    DayVolume: 'DayVolume',
}

export function requestDayVolume() {
    const fromDate = new Date().addDays(-1).clearTime()
    const toDate = new Date(fromDate).addDays(1)
    EtherDeltaWebSocket.getTokenVolume(RequestReason.DayVolume, fromDate, toDate)
    StatsActions.dayVolumeRequested(fromDate)
}

export function handleTokenVolumeResponse(message) {
    const reason = ((message.tokenVolume || {}).request || {}).reason

    if (message.status === 'error') {
        if (reason === 'DayVolume') {
            StatsActions.dayVolumeRequestFailed(message.message)
        }
    } else {
        if (reason === 'DayVolume') {
            StatsActions.dayVolumeRetrieved(message.tokenVolume)
        }
    }
}
