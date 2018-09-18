import * as StatsActions from "../actions/StatsActions"
import StatsStore from "../stores/StatsStore"
import EtherDeltaWebSocket from "../EtherDeltaSocket"
import moment from 'moment'
import * as StatsVolumeChartUtil from "../util/StatsVolumeChartUtil"


const RequestReason = {
    DayVolume: 'DayVolume',
    WeekVolume: 'WeekVolume',
    RangeByDayVolume: 'RangeByDayVolume',
}

export function changeRangeByDayFromDayThenRefresh(day) {
    StatsActions.changeRangeByDayVolumeFromDate(day)
    requestRangeByDayVolumeIfRangeIsOk()
}

export function changeRangeByDayToDayThenRefresh(day) {
    StatsActions.changeRangeByDayVolumeToDate(day)
    requestRangeByDayVolumeIfRangeIsOk()
}

function requestRangeByDayVolumeIfRangeIsOk() {
    const fromDate = moment(StatsStore.getRangeByDayVolume().selectedFromDate)
    const toDate =  moment(StatsStore.getRangeByDayVolume().selectedToDate)
    const duration = moment.duration(toDate.diff(fromDate)).asDays()

    if (duration > 31) {
        StatsActions.rangeByDayRangeTooWideError(duration)
    } else {
        requestRangeByDayVolume()
    }
}

export function requestRangeByDayVolume() {
    const fromDate = StatsStore.getRangeByDayVolume().selectedFromDate
    const toDate = StatsStore.getRangeByDayVolume().selectedToDate
    EtherDeltaWebSocket.getTokenVolume(RequestReason.RangeByDayVolume, fromDate, toDate, null, 'day')
    StatsActions.rangeByDayVolumeRequested(fromDate, toDate)
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
    const {to, from} = StatsVolumeChartUtil.getWeekRange(day)
    StatsActions.changeWeeklyVolumeDate(from)
    requestWeekVolume()
}

export function requestWeekVolume() {
    const {to, from} = StatsVolumeChartUtil.getWeekRange(StatsStore.getWeekVolume().selectedDate)
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
        } else if (reason === 'RangeByDayVolume') {
            StatsActions.rangeByDayVolumeRequestFailed(message.message)
        }
    } else {
        if (reason === 'DayVolume') {
            StatsActions.dayVolumeRetrieved(message.tokenVolume)
        } else if (reason === 'WeekVolume') {
            StatsActions.weekVolumeRetrieved(message.tokenVolume)
        } else if (reason === 'RangeByDayVolume') {
            StatsActions.rangeByDayVolumeRetrieved(message.tokenVolume)
        }
    }
}
