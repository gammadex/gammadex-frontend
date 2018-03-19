import React from "react"
import _ from "lodash"

/**
 * Note - pages are zero indexed, but are displayed as 1 indexed
 */
export default class Pagination extends React.Component {
    onPageChange(page, event) {
        this.props.onPageChange(page)
        event.preventDefault()
    }

    render() {
        const {page, numPages} = this.props

        const first = this.first(page)
        const prev = this.prev(page)
        const next = this.next(page, numPages)
        const last = this.last(page, numPages)
        const numberedLinks = this.numberedPages(page, numPages)

        return (
            <ul className="pagination">
                {first}
                {prev}
                {numberedLinks}
                {next}
                {last}
            </ul>
        )
    }

    pageLink(text, linkToPage, disabled, current = false) {
        const disabledClass = disabled ? "disabled" : ""
        const activeClass = current ? "active" : ""
        const classes = `page-item ${disabledClass} ${activeClass}`

        let link = <a className="page-link" href="#" onClick={(event) => this.onPageChange(linkToPage, event)}>{text}</a>
        if (current) {
            link = <span className="page-link active">{text}</span>
        }

        return <li key={text} className={classes}>{link}</li>
    }

    first(page) {
        const disabled = (page === 0)
        return this.pageLink('First', 0, disabled)
    }

    prev(page) {
        const disabled = (page === 0)
        const prevPage = page - 1;
        return this.pageLink('Prev', prevPage, disabled)
    }

    next(page, numPages) {
        const lastPage = Math.max(0, numPages - 1)
        const disabled = (page === lastPage)
        const nextPage = page + 1
        return this.pageLink('Next', nextPage, disabled)
    }

    last(page, numPages) {
        const lastPage = Math.max(0, numPages - 1)
        const disabled = (page === lastPage)
        return this.pageLink('Last', lastPage, disabled)
    }

    numberedPages(page, numPages) {
        const numDisplay = 5
        const numEachSide = Math.floor(numDisplay / 2)

        const targetLeft = page - numEachSide
        const leftOverLeft = Math.abs(targetLeft - Math.max(targetLeft, 0))

        const targetRight = page + numEachSide
        const leftOverRight = Math.abs(targetRight - Math.min(targetRight, numPages - 1))

        const startPage = Math.max(targetLeft - leftOverRight, 0)
        const endPage = Math.min(targetRight + leftOverLeft, numPages - 1)

        return _.range(startPage, endPage + 1).map(p => {
            return this.pageLink(p + 1, p, false, (p === page))
        })
    }
}