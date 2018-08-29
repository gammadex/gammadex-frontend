import Config from '../Config'
import _ from 'lodash'

function key(name) {
    return Config.getReactEnv() + '.' + name
}

export function getFavouritesFromLocalStorage() {
    if (localStorage[key('favourites')]) {
        return JSON.parse(localStorage[key('favourites')])
    }
    return {}
}

export function getFavourite(propName, defaultValue) {
    const favourites = getFavouritesFromLocalStorage()

    if (! _.isUndefined(favourites[propName])) {
        return favourites[propName]
    } else if (! _.isUndefined(defaultValue)) {
        setFavourite(propName, defaultValue)
        return defaultValue
    }
}

export function setFavourite(propName, propVal) {
    const favourites = getFavouritesFromLocalStorage()
    favourites[propName] = propVal
    localStorage[key('favourites')] = JSON.stringify(favourites)
}