import dateformat from 'dateformat'

export function formatDateForDisplay(date, withYear = false, noSeconds = false) {
    const parsed = Date.parse(date)

    if (isNaN(parsed)) {
        return date
    }

    const seconds = noSeconds ? '' : ':ss'
    const format = withYear ? 'yyyy-mm-dd HH:MM' : 'mm-dd HH:MM'

    return dateformat(parsed, format + seconds)
}