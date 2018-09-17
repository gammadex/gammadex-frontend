import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import ActionNames from "../actions/ActionNames"
import * as StatsUtil from "../util/StatsUtil"
import datejs from 'datejs'

class StatsStore extends EventEmitter {
    constructor() {
        super()

        this.dayVolume = {
            retrievingDayVolumeStats: false,
            retrievingDayVolumeError: null,
            stats: [],
            date: null,
            selectedDate: new Date().addDays(-1),
            displayNum: 10,
            includeOther: false,
            rawVolumes: []
        }

        this.weekVolume = {
            retrievingDayVolumeStats: false,
            retrievingDayVolumeError: null,
            stats: [],
            date: null,
            selectedDate: new Date().addDays(-1),
            displayNum: 10,
            includeOther: false,
            rawVolumes: []
        }
    }

    getDayVolume = () => {
        return this.dayVolume
    }

    getWeekVolume = () => {
        return this.weekVolume
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_SENT: {
                this.dayVolume.retrievingDayVolumeStats = true
                this.dayVolume.retrievingDayVolumeError = null
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_FAILED: {
                this.dayVolume.retrievingDayVolumeStats = false
                this.dayVolume.retrievingDayVolumeError = action.error
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_VOLUME_REQUEST_RETRIEVED: {
                this.dayVolume.date = action.message.request.fromDate
                this.dayVolume.rawVolumes = action.message.volumes
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
                this.weekVolume.retrievingDayVolumeStats = true
                this.weekVolume.retrievingDayVolumeError = null
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_FAILED: {
                this.weekVolume.retrievingDayVolumeStats = false
                this.weekVolume.retrievingDayVolumeError = action.error
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_WEEK_VOLUME_REQUEST_RETRIEVED: {
                console.log("volume retrieved", action)
                this.weekVolume.date = action.message.request.fromDate
                this.weekVolume.rawVolumes = action.message.volumes
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
        }
    }

    updateDayStats() {
        this.dayVolume.stats = StatsUtil.topStats(this.dayVolume.rawVolumes, this.dayVolume.displayNum, this.dayVolume.includeOther)
    }

    updateWeekStats() {
        this.weekVolume.stats = StatsUtil.topStats(this.weekVolume.rawVolumes, this.weekVolume.displayNum, this.weekVolume.includeOther)
    }
}

const statsStore = new StatsStore()
dispatcher.register(statsStore.handleActions.bind(statsStore))

export default statsStore