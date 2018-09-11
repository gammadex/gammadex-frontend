import React from 'react'
import ReactGA from 'react-ga'
import Config from '../Config'

const prod = Config.isProduction()

export function initAnalytics() {
  if (prod) {
    ReactGA.initialize('UA-124438522-1')
  }
}

export function withAnalytics(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      if (this.props.location) {
        this.trackPage(this.props.location.pathname)
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.location) {
        const currentPage = this.props.location.pathname
        const nextPage = nextProps.location.pathname
        if (currentPage !== nextPage) {
          this.trackPage(nextPage)
        }
      }
    }

    trackPage(page) {
      if (prod) {
        ReactGA.set({ page })
        ReactGA.pageview(page)
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

export function setUserId(userId) {
  if (prod) {
    ReactGA.set({ userId })
  }
}