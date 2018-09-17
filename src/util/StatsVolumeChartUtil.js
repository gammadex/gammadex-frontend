export function getDataAndLayout(stats, chartContainerWidth, chartContainerHeight) {
    const data = [{

        y: stats.map(s => s.volumeInEth),
        x: stats.map(s => s.tokenSymbol),
        labels: stats.map(s => s.tokenName),
        hole: .5,
        type: 'bar',
        showlegend: false,
        marker: {
            color: '#3498DB',
            bgcolor: '#3498DB',
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
            b: 60,
            t: 0,
            pad: 4
        },
    }

    return {
        data, layout
    }
}