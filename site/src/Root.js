import React, { Component } from 'react'
import logo from './logo.svg'
import Player from './Player'

import './Root.css'

class Root extends Component {

    constructor(props) {
        super(props)

        this.mousePosition = {}
        this.currentPlayer = ''

        this.state = {
            players: [],
            status: 'move'
        }

    }

    componentDidMount() {
        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('sync', (body) => {
                this.setState({ players: body.players })
            })

            window.socketio.on('created', (body) => {
                this.currentPlayer = body.id
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
            })
        })
    }

    _handleMouseDown(e) {
        e.preventDefault()
        const { status } = this.state
        if(e.button === 2) {
            if(status !== 'move') {
                this.setState({ status: 'move' })
            } else {
                window.socketio.emit(status, {
                    id: this.currentPlayer,
                    position: this.mousePosition
                })
            }
        } else {
            window.socketio.emit(status, {
                id: this.currentPlayer,
                position: this.mousePosition
            })
        }
    }

    _handleKeyDown(e) {
        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case '1':
                return this.setState({ status: 'fireball' })
        }
    }

    render() {
        return (
            <div className='root'>
                <header className='root-header'>
                    <img src={logo} className='root-logo' alt='logo' />
                    <h1 className='root-title'>Welcome to React</h1>
                </header>
                <div className='game-container' tabIndex='1'
                    onMouseMove={e => this.mousePosition = { x: e.pageX, y: e.pageY - 190 } }
                    onMouseDown={this._handleMouseDown.bind(this)}
                    onKeyDown={this._handleKeyDown.bind(this)}>
                    {
                        this.state.players.map(pl => <Player key={pl.id} id={pl.id} position={pl.position} />)
                    }
                </div>
            </div>
        )
    }
}

export default Root
