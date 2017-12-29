import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'
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
            mapName: '',
            user: {},
            ping: 0,
            status: 'move',
            roomName: '',
            roomJoined: '',
            gameIsRunning: false,
            roomJoinedIsOwner: false,
            isReady: false,
            isWinner: false
        }

    }

    componentDidMount() {
        window.socketio.on('connect', (socket) => {
            console.log('SocketIO :: Connected')

            window.socketio.on('sync', (body) => {
                const ping = moment().diff(body.sendTime)
                this.setState({ players: body.players, spells: body.spells, ping })
                this.currentPlayer = body.players.find(x => x.id === this.currentPlayerId)
            })

            window.socketio.on('player_create', (body) => {
                this.currentPlayerId = body.id
            })

            window.socketio.on('game_will_start', ({map}) => this.setState({ mapName: map.name, gameIsRunning: true }))
            window.socketio.on('game_start', () => {} )

            window.socketio.on('game_will_end', (body) => {
                const isWinner = body.winner.id === this.currentPlayerId
                this.setState({ isWinner, isReady: false })
                if(isWinner) {
                    alert('GANHO BOA PORRA')
                } else {
                    alert('SE FUDEU EM')
                }
            })
            window.socketio.on('game_end', (body) => this.setState({ map: {}, players: [], spells: [], gameIsRunning: false, isReady: false }))

            window.socketio.on('map_create', (body) => this.setState({ map: body }))
            window.socketio.on('map_update', (body) => this.setState({ map: body }))

            window.socketio.on('myuser_info', (body) => {
                this.setState({ user: body })
            })

            window.socketio.on('myuser_joined_room', (body) => {
                this.setState({ roomJoined: body.room.name, user: body.user })
            })

            window.socketio.on('disconnect', () => {
                console.log('SocketIO :: Disconnected')
            })
        })

        window.addEventListener('keydown', this._handleKeyDown.bind(this), true)
    }

    _handleJoinRoom() {
        this.setState({ roomJoinedIsOwner: false })
        window.socketio.emit('room_join', { name: this.state.roomName, userName: this.state.userName })
    }

    _handleCreateRoom() {
        this.setState({ roomJoinedIsOwner: true })
        window.socketio.emit('room_create', { name: this.state.roomName, userName: this.state.userName })
    }

    _toggleReady() {
        const { isReady } = this.state
        this.setState({ isReady: !isReady })
        if(isReady) {
            window.socketio.emit('user_waiting', {})
        } else {
            window.socketio.emit('user_ready', {})
        }
    }

    _handleStart(mapName) {
        window.socketio.emit('game_start', { map: mapName })
    }

    _handleMouseDown(e) {
        e.preventDefault()
        const { status } = this.state

        if(this.currentPlayer == null) return

        this.emitAction(status)
        this.setState({ status: 'move', positionToGo: this.mousePosition })
    }

    _handleKeyDown(e) {
        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case 'q':
                return this.setState({ status: 'spell_fireball' })
            case 'e':
                return this.emitAction('spell_reflect_shield')
        }
    }

    emitAction(action) {
        window.socketio.emit(`player_${action}`, {
            id: this.currentPlayerId,
            position: this.mousePosition,
            direction: vector.direction(this.currentPlayer.position, this.mousePosition),
        })
    }

    render() {
        const { map } = this.state
        const halfMapSize = map.size / 2

        return (
            <div className='root'>
                <header className='root-header'>
                    {/* <img src={logo} className='root-logo' alt='logo' /> */}
                    <h1 className='root-title'>Welcome to tutu game fuck u ({this.state.ping}ms)</h1>
                    {
                        !this.state.gameIsRunning ?
                        <div>
                            { this.state.roomJoined === '' ?
                                <div>
                                    <input placeholder='User name' onChange={e => this.setState({ userName: e.target.value })} value={this.state.userName}/>
                                    <br />
                                    <input placeholder='Room name' onChange={e => this.setState({ roomName: e.target.value })} value={this.state.roomName}/>
                                    <button onClick={this._handleJoinRoom.bind(this)}>Enter room</button>
                                    <button onClick={this._handleCreateRoom.bind(this)}>Create room</button>
                                </div>
                                :
                                <div style={{ backgroundColor: this.state.user.color, paddingTop: 10 }}>
                                    <div style={{ backgroundColor: '#222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <p>{this.state.roomJoined}</p>
                                        {
                                            this.state.isReady ?
                                            <button style={{ width: 100 }} onClick={this._toggleReady.bind(this)}>WAITING</button>
                                            :
                                            <button style={{ width: 100 }} onClick={this._toggleReady.bind(this)}>READY</button>
                                        }
                                        {
                                            this.state.roomJoinedIsOwner &&
                                            <div>
                                                <button style={{ width: 100 }} onClick={() => this._handleStart('BasicArena')}>START GAME BASIC</button>
                                                <button style={{ width: 100 }} onClick={() => this._handleStart('FireArena')}>START GAME FIRE</button>
                                                <button style={{ width: 100 }} onClick={() => this._handleStart()}>START GAME RANDOM</button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        :
                        <div>
                            <p className='root-map-name'>{this.state.mapName}</p>
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
                    onMouseMove={e => this.mousePosition = { x: e.pageX , y: e.pageY - 200 } }
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
