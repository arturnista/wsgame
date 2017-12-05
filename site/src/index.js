import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Root from './Root'
import { serverUrl } from './constants'

var host = serverUrl.replace(/^http/, 'ws')
window.socket = new WebSocket(host)

ReactDOM.render(<Root />, document.getElementById('root'))
