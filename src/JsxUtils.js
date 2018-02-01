import React from "react"
import _ from "lodash"

export function emptyRows(numEmptyRows, numCols) {
    const tds = _.range(numCols).map((n) => {
        return <td key={n}>&nbsp;</td>
    })

    return _.range(numEmptyRows).map((n) => {
        return <tr key={"empty_" + n}>{tds}</tr>
    })
}