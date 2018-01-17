import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import RootDownload from './RootDownload'
import { serverUrl } from './constants'
import io from 'socket.io-client'

// if(window.location.hostname === 'localhost') window.socketio = io(serverUrl)
// else window.socketio = io()

ReactDOM.render(<RootDownload />, document.getElementById('root'))
