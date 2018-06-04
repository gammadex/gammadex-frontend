import _ from "lodash"

export function cleanMessage(message) {
    if (!_.isString(message)) {
        return message
    }

    const terminators = [{
        match: ': { ',
        replace: '.'
    }, {
        match: '. at ',
        replace: '.'
    }]

    return _.reduce(terminators, (acc, terminator) => {
        if (acc.includes(terminator.match)) {
            return acc.split(terminator.match)[0] + terminator.replace
        } else {
            return acc
        }
    }, message)
}