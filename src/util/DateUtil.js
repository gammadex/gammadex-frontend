import dateformat from 'dateformat'

export function formatDateForDisplay(date, withYear = false) {
    const parsed = Date.parse(date)

    if (isNaN(parsed)) {
        return date
    }

    const format = withYear ? 'yyyy-mm-dd HH:MM:ss' : 'mm-dd HH:MM:ss'

    return dateformat(parsed, format)
}