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
    }

    getDayVolume = () => {
        return this.dayVolume
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
                console.log("volume retrieved", action)
                this.dayVolume.date = action.message.request.fromDate
                this.dayVolume.rawVolumes = action.message.volumes
                this.updateStats(action)
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
                this.updateStats(action)
                this.emitChange()
                break
            }
            case ActionNames.TOKEN_VOLUME_DAY_CHANGE_SHOW_OTHER: {
                this.dayVolume.includeOther = action.isShow
                this.updateStats(action)
                this.emitChange()
                break
            }
        }
    }

    updateStats(action) {
        this.dayVolume.stats = StatsUtil.topStats(this.dayVolume.rawVolumes, this.dayVolume.displayNum, this.dayVolume.includeOther)
    }
}

const statsStore = new StatsStore()
dispatcher.register(statsStore.handleActions.bind(statsStore))

export default statsStore