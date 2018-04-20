import dateformat from 'dateformat'

export function getInitialDateRange(periodInMins, startTime, endTime, format = 'yyyy-mm-dd HH:MM') {
    const lengthInDays = parseInt(periodInMins, 10) >= (24 * 60) ? 5 : 2

    const calculatedStart = new Date(endTime)
    calculatedStart.setDate(calculatedStart.getDate() - lengthInDays);
    const actualStart = new Date(startTime)

    const start = actualStart > calculatedStart ? actualStart : calculatedStart
    const end = new Date(endTime)

    return [start, end].map(d => dateformat(d, format))
}
