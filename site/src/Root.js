import React, { Component } from 'react'
import _ from 'lodash'
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
        this.currentPlayer = null

        this.state = {
            positionToGo: {},
            players: [],
            spells: [],
            map: {},
            status: 'move',
            roomName: '',
            roomJoined: '',
            isWinner: false
        }

    }

    componentDidMount() {
        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('sync', (body) => {
                this.setState({ players: body.players, spells: body.spells })
                this.currentPlayer = body.players.find(x => x.id === this.currentPlayerId)
            })

            window.socketio.on('player_create', (body) => {
                this.currentPlayerId = body.id
            })

            window.socketio.on('game_will_end', (body) => this.setState({ isWinner: body.winner.id === this.currentPlayerId }))
            window.socketio.on('game_end', (body) => this.setState({ map: {}, players: [], spells: [] }))

            window.socketio.on('map_create', (body) => this.setState({ map: body }))
            window.socketio.on('map_update', (body) => this.setState({ map: body }))

            window.socketio.on('myuser_info', (body) => {
                console.log(body)
            })

            window.socketio.on('myuser_joined_room', (body) => {
                this.setState({ roomJoined: body.name })
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
            })
        })

        window.addEventListener('keydown', this._handleKeyDown.bind(this), true)
    }

    _handleJoinRoom() {
        window.socketio.emit('room_join', { name: this.state.roomName })
    }

    _handleCreateRoom() {
        window.socketio.emit('room_create', { name: this.state.roomName })
    }

    _handleReady() {
        window.socketio.emit('user_ready', {})
    }

    _handleStart() {
        window.socketio.emit('game_start', {})
    }

    _handleMouseDown(e) {
        e.preventDefault()
        const { status } = this.state

        if(this.currentPlayer == null) return

        window.socketio.emit(`player_${status}`, {
            id: this.currentPlayerId,
            position: this.mousePosition,
            direction: vector.direction(this.currentPlayer.position, this.mousePosition),
        })
        this.setState({ status: 'move', positionToGo: this.mousePosition })
    }

    _handleKeyDown(e) {
        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case 'q':
                return this.setState({ status: 'spell_fireball' })
        }
    }

    render() {
        const { map } = this.state
        const halfMapSize = map.size / 2

        return (
            <div className='root'>
                <header className='root-header'>
                    {/* <img src={logo} className='root-logo' alt='logo' /> */}
                    <h1 className='root-title'>Welcome to tutu game fuck u</h1>
                    { this.state.roomJoined === '' ?
                        <div>
                            <input placeholder='Room name' onChange={e => this.setState({ roomName: e.target.value })} value={this.state.roomName}/>
                            <button onClick={this._handleJoinRoom.bind(this)}>Enter room</button>
                            <button onClick={this._handleCreateRoom.bind(this)}>Create room</button>
                        </div>
                        :
                        <div>
                            <p>{this.state.roomJoined}</p>
                            <button onClick={this._handleReady.bind(this)}>READY</button>
                            <button onClick={this._handleStart.bind(this)}>START GAME</button>
                        </div>
                    }
                    {
                        this.currentPlayer ?
                        <p>Life: {this.currentPlayer.life.toFixed(2)} ({this.currentPlayer.knockbackValue})</p>
                        :
                        <p>DEAD</p>
                    }
                    {
                        this.state.isWinner && <p>GANHO CARALHO</p>
                    }
                </header>
                <div className='game-container'
                    onMouseMove={e => this.mousePosition = { x: e.pageX - (window.innerWidth * .3) , y: e.pageY - 190 } }
                    onMouseDown={this._handleMouseDown.bind(this)}
                    onKeyDown={this._handleKeyDown.bind(this)}>
                    {
                        !_.isEmpty(this.state.map) &&
                        <div className='game-player'
                            style={{ left: map.position.x - halfMapSize, top: map.position.y - halfMapSize, width: map.size, height: map.size, backgroundColor: 'gray', borderRadius: halfMapSize }}/>
                    }
                    <div className='game-player click-pos'
                        style={{ left: this.state.positionToGo.x - 5, top: this.state.positionToGo.y - 5 }} />
                    {
                        this.state.players.map(player => <Player key={player.id} {...player} />)
                    }
                    {
                        this.state.map.obstacles &&
                        this.state.map.obstacles.map(obs => {
                            const halfSize = obs.collider.size / 2
                            return (
                                <div key={obs.id} className='game-player'
                                    style={{ left: obs.position.x - halfSize, top: obs.position.y - halfSize, width: obs.collider.size, height: obs.collider.size, backgroundColor: 'blue', borderRadius: halfSize }}/>
                            )
                        })
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
