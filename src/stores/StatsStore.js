import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import * as StatsUtil from "../util/StatsUtil"
import datejs from 'datejs'
import * as StatsVolumeChartUtil from "../util/StatsVolumeChartUtil"
import moment from 'moment'

class StatsStore extends EventEmitter {
    constructor() {
        super()

        this.dayVolume = {
            retrievingStats: false,
            retrievedStats: false,
            retrieveError: null,
            stats: null,
            date: null,
            selectedDate: new Date().addDays(-1),
            displayNum: 10,
            includeOther: false,
            rawVolumes: []
        }

        this.weekVolume = {
            retrievingStats: false,
            retrievedStats: false,
            retrieveError: null,
            stats: null,
            date: null,
            selectedDate: moment().startOf('week').subtract(1, 'day').startOf('week').toDate(),
            displayNum: 10,
            includeOther: false,
            rawVolumes: []
        }

        this.rangeByDayVolume = {
            retrievingStats: false,
            retrievedStats: false,
            retrieveError: null,
            stats: null,
            fromDate: null,
            toDate: null,
            selectedFromDate: new Date().addDays(-30),
            selectedToDate: new Date().addDays(-1),
            displayNum: 10,
            includeOther: false,
            rawVolumes: [],
            rangeTooWideDays: 0,
        }
    }

    getDayVolume = () => {
        return this.dayVolume
    }

    getWeekVolume = () => {
        return this.weekVolume
    }

    getRangeByDayVolume = () => {
        return this.rangeByDayVolume
    }

    isRefreshInProgress = () => {
        return this.dayVolume.retrievingStats || this.weekVolume.retrievingStats || this.rangeByDayVolume.retrievingStats
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_SENT: {
                this.dayVolume.retrievingStats = true
                this.dayVolume.retrieveError = null
                this.dayVolume.retrievedStats = false
                this.dayVolume.stats = null
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_FAILED: {
                this.dayVolume.retrievingStats = false
                this.dayVolume.retrieveError = action.error
                this.dayVolume.retrievedStats = false
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_RETRIEVED: {
                this.dayVolume.date = action.message.request.fromDate
                this.dayVolume.rawVolumes = action.message.volumes
                this.dayVolume.retrievingStats = false
                this.dayVolume.retrievedStats = true
                this.updateDayStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_CHANGE_DATE: {
                this.dayVolume.selectedDate = action.date
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_CHANGE_DISPLAY_NUM: {
                this.dayVolume.displayNum = action.displayNum
                this.updateDayStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_CHANGE_SHOW_OTHER: {
                this.dayVolume.includeOther = action.isShow
                this.updateDayStats()
                this.emitChange()
                break
            }

            case ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_SENT: {
                this.weekVolume.retrievingStats = true
                this.weekVolume.retrieveError = null
                this.weekVolume.retrievedStats = false
                this.weekVolume.stats = null
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_FAILED: {
                this.weekVolume.retrievingStats = false
                this.weekVolume.retrieveError = action.error
                this.weekVolume.retrievedStats = false
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_RETRIEVED: {
                this.weekVolume.date = action.message.request.fromDate
                this.weekVolume.rawVolumes = action.message.volumes
                this.weekVolume.retrievingStats = false
                this.weekVolume.retrievedStats = true
                this.updateWeekStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_CHANGE_DATE: {
                this.weekVolume.selectedDate = action.date
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_CHANGE_DISPLAY_NUM: {
                this.weekVolume.displayNum = action.displayNum
                this.updateWeekStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_CHANGE_SHOW_OTHER: {
                this.weekVolume.includeOther = action.isShow
                this.updateWeekStats()
                this.emitChange()
                break
            }

            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_VOLUME_REQUEST_SENT: {
                this.rangeByDayVolume.retrievingStats = true
                this.rangeByDayVolume.retrieveError = null
                this.rangeByDayVolume.retrievedStats = false
                this.rangeByDayVolume.stats = null
                this.rangeByDayVolume.rangeTooWideDays = 0
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_VOLUME_REQUEST_FAILED: {
                this.rangeByDayVolume.retrievingStats = false
                this.rangeByDayVolume.retrieveError = action.error
                this.rangeByDayVolume.retrievedStats = false
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_VOLUME_REQUEST_RETRIEVED: {
                this.rangeByDayVolume.date = action.message.request.fromDate
                this.rangeByDayVolume.rawVolumes = action.message.volumes
                this.rangeByDayVolume.retrievingStats = false
                this.rangeByDayVolume.retrievedStats = true
                this.updateRangeByDayStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_CHANGE_FROM_DATE: {
                this.rangeByDayVolume.selectedFromDate = action.date
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_CHANGE_TO_DATE: {
                this.rangeByDayVolume.selectedToDate = action.date
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_CHANGE_DISPLAY_NUM: {
                this.rangeByDayVolume.displayNum = action.displayNum
                this.updateRangeByDayStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_CHANGE_SHOW_OTHER: {
                this.rangeByDayVolume.includeOther = action.isShow
                this.updateRangeByDayStats()
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_RANGE_BY_DAY_RANGE_TOO_WIDE: {
                this.rangeByDayVolume.rangeTooWideDays = action.rangeInDays
                this.emitChange()
                break
            }


        }
    }

    updateDayStats() {
        this.dayVolume.stats = StatsUtil.topStats(this.dayVolume.rawVolumes, this.dayVolume.displayNum, this.dayVolume.includeOther)
    }

    updateWeekStats() {
        this.weekVolume.stats = StatsUtil.topStats(this.weekVolume.rawVolumes, this.weekVolume.displayNum, this.weekVolume.includeOther)
    }

    updateRangeByDayStats() {
        this.rangeByDayVolume.stats = StatsUtil.topStatsByDay(this.rangeByDayVolume.rawVolumes, this.rangeByDayVolume.displayNum, this.rangeByDayVolume.includeOther)
    }
}

const statsStore = new StatsStore()
dispatcher.register(statsStore.handleActions.bind(statsStore))

export default statsStore