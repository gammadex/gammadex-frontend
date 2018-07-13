import Config from '../Config'

function key(name) {
    return Config.getReactEnv() + '.' + name
}

export function getFavouritesFromLocalStorage() {
    if (localStorage[key('favourites')]) {
        return JSON.parse(localStorage[key('favourites')])
    }
    return {}
}

export function getFavourite(propName) {
    return getFavouritesFromLocalStorage()[propName]
}

export function setFavourite(propName, propVal) {
    const favourites = getFavouritesFromLocalStorage()
    favourites[propName] = propVal
    localStorage[key('favourites')] = JSON.stringify(favourites)
}