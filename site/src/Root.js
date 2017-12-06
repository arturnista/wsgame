import React, { Component } from 'react'
import logo from './logo.svg'
import Player from './Player'
import Spell from './Spell'
import vector from './utils/vector'

import './Root.css'

class Root extends Component {

    constructor(props) {
        super(props)

        this.mousePosition = {}
        this.currentPlayerId = ''
        this.currentPlayer = {}

        this.state = {
            players: [],
            spells: [],
            status: 'move'
        }

    }

    componentDidMount() {
        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('sync', (body) => {
                this.setState({ players: body.players, spells: body.spells })
                this.currentPlayer = body.players.find(x => x.id === this.currentPlayerId)
            })

            window.socketio.on('created', (body) => {
                this.currentPlayerId = body.id
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
            })
        })
    }

    _handleMouseDown(e) {
        e.preventDefault()
        const { status } = this.state
        window.socketio.emit(status, {
            id: this.currentPlayerId,
            position: this.mousePosition,
            direction: vector.direction(this.currentPlayer.position, this.mousePosition),
        })
        this.setState({ status: 'move' })
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
                    <h1 className='root-title'>Welcome to tutu game fuck u</h1>
                </header>
                <div className='game-container' tabIndex='0' autoFocus
                    onMouseMove={e => this.mousePosition = { x: e.pageX, y: e.pageY - 190 } }
                    onMouseDown={this._handleMouseDown.bind(this)}
                    onKeyDown={this._handleKeyDown.bind(this)}>
                    {
                        this.state.players.map(player => <Player key={player.id} {...player} />)
                    }
                    {
                        this.state.spells.map(spell => <Spell key={spell.id} {...spell} />)
                    }
                </div>
            </div>
        )
    }
}

export default Root
