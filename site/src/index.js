import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Root from './Root'
import { serverUrl } from './constants'
import io from 'socket.io-client'

// var host = serverUrl.replace(/^http/, 'ws')
// window.socket = new WebSocket(host)
window.socketio = io(serverUrl)

ReactDOM.render(<Root />, document.getElementById('root'))
