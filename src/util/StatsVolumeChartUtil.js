import datejs from 'datejs'
import moment from 'moment'

export function getDataAndLayout(stats, chartContainerWidth, chartContainerHeight, barColour='#3498DB') {
    const data = [{

        y: stats.map(s => s.volumeInEth),
        x: stats.map(s => s.tokenSymbol),
        labels: stats.map(s => s.tokenName),
        hole: .5,
        type: 'bar',
        showlegend: false,
        marker: {
            color: barColour,
            bgcolor: barColour,
            /* size: 12,*/
            line: {
                color: 'transparent',
                width: 2
            }
        },
        textinfo: 'text'
    }]

    const layout = {
        width: chartContainerWidth,
        height: chartContainerHeight,
        color: '#555555',
        plot_bgcolor: 'transparent',
        xaxis: {
            linecolor: '#555555',
            gridcolor: 'transparent',
            color: '#ced2d5',
        },
        yaxis: {
            linecolor: 'transparent',
            gridcolor: '#555555',
            color: '#ced2d5',
            zeroline: false,
        },
        margin: {
            l: 60,
            r: 60,
            b: 100,
            t: 20,
            pad: 4
        },
    }

    return {
        data, layout
    }
}

export function getWeekRange(date) {
    return {
        from: moment(date)
            .startOf('week')
            .toDate(),
        to: moment(date)
            .endOf('week')
            .toDate(),
    }
}

export function statsDayRange() {
    return {
        before: new Date(2017, 2, 9),
        after: new Date().addDays(-1),
    }
}

export function statsWeekRange() {
    return {
        before: moment(new Date(2017, 2, 9))
            .startOf('week')
            .toDate(),
        after: moment()
            .startOf('week')
            .subtract(1, 'days')
            .endOf('week')
            .toDate(),
    }
}