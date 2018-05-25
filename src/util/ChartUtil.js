import dateformat from 'dateformat'
import datejs from 'datejs'

export function getInitialDateRange(periodInMins, startTime, endTime, format = 'yyyy-mm-dd HH:MM') {
    const lengthInDays = parseInt(periodInMins, 10) >= (24 * 60) ? 6 : 2

    const calculatedStart = new Date(endTime)
    calculatedStart.setDate(calculatedStart.getDate() - lengthInDays)
    const actualStart = new Date(startTime)

    const start = actualStart > calculatedStart ? actualStart : calculatedStart
    const end = new Date(endTime)

    return [start.addMinutes(-periodInMins/2), end.addMinutes(periodInMins/2)].map(d => dateformat(d, format))
}
