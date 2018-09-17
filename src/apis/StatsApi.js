import * as StatsActions from "../actions/StatsActions"
import StatsStore from "../stores/StatsStore"
import EtherDeltaWebSocket from "../EtherDeltaSocket"
import * as TokenBalancesActions from "../actions/TokenBalancesActions"
import moment from 'moment'
import * as StatsVolumeChartUtil from "../util/StatsVolumeChartUtil"

const RequestReason = {
    DayVolume: 'DayVolume',
    WeekVolume: 'WeekVolume',
}

export function changeDayVolumeDayThenRefresh(day) {
    StatsActions.changeDailyVolumeDate(day)
    requestDayVolume()
}

export function requestDayVolume() {
    const fromDate = StatsStore.getDayVolume().selectedDate
    const toDate = moment(fromDate).add(1, 'days')
    EtherDeltaWebSocket.getTokenVolume(RequestReason.DayVolume, fromDate, toDate)
    StatsActions.dayVolumeRequested(fromDate)
}

export function changeWeekVolumeWeekThenRefresh(day) {
    const {to, from}  = StatsVolumeChartUtil.getWeekRange(day)
    StatsActions.changeWeeklyVolumeDate(from)
    requestWeekVolume()
}

export function requestWeekVolume() {
    const {to, from}  = StatsVolumeChartUtil.getWeekRange(StatsStore.getWeekVolume().selectedDate)
    EtherDeltaWebSocket.getTokenVolume(RequestReason.WeekVolume, from, to)
    StatsActions.weekVolumeRequested(from)
}

export function handleTokenVolumeResponse(message) {
    const reason = ((message.tokenVolume || {}).request || {}).reason

    if (message.status === 'error') {
        if (reason === 'DayVolume') {
            StatsActions.dayVolumeRequestFailed(message.message)
        } else if (reason === 'WeekVolume') {
            StatsActions.weekVolumeRequestFailed(message.message)
        }
    } else {
        if (reason === 'DayVolume') {
            StatsActions.dayVolumeRetrieved(message.tokenVolume)
        } else if (reason === 'WeekVolume') {
            StatsActions.weekVolumeRetrieved(message.tokenVolume)
        }
    }
}
