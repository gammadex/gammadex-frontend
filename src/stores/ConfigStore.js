import {EventEmitter} from "events"
import dispatcher from "../dispatcher"
import Actions from "../actions/ActionNames.js"
import config from '../config/main.json'
import _ from "lodash"

class ConfigStore extends EventEmitter {
    constructor() {
        super()
        this.config = {}
    }

    getTokens() {
        return this.config.tokens
    }

    getTokenName(address) {
        return _.filter(this.config.tokens, (tk) => tk.address === address)[0].name
    }

    getTokenAddress(name) {
        return _.filter(this.config.tokens, (tk) => tk.name === name)[0].address
    }

    getDefaultToken() {
        const name = this.config.defaultPair.token
        const address = this.getTokenAddress(name)

        return {
            name,
            address
        }
    }

    emitChange() {
        this.emit("change")
    }

    handleActions(action) {
        switch (action.type) {
            case Actions.LOAD_CONFIG: {
                this.config = config
                this.emitChange()
                break;
            }
        }
    }
}

const configStore = new ConfigStore()
dispatcher.register(configStore.handleActions.bind(configStore))

export default configStore