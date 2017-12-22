const _ = require('lodash')
const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjects/GameObjectController')
const Physics = require('./Physics')
const MapController = require('./Map/MapController')

const DELAY_TO_START = 3000
const DELAY_TO_END = 5000

const FIREBALL_CD = 1000

let COLORS = [
    '#ff0000',
    '#0000ff',
    '#00ffff',
    '#ff00ff',
    '#ffff00',
    '#ff8000',
    '#00ff00',
    '#ffaaaa',
    '#aaaaaa',
]

function Room(socketIo, data) {
    this.now = moment()
    this.name = data.name

    this.socketIo = socketIo

    this.gameObjectController = new GameObjectController(this.emit.bind(this))
    this.mapController = new MapController(this.gameObjectController, this.emit.bind(this))
    this.physics = new Physics(this.gameObjectController)

    this.gameIsRunning = false
    this._gameEnded = false
    this.users = []
    this.owner = null
}

Room.prototype.info = function () {
    return {
        name: this.name,
        owner: this.owner.info(),
        usersNumber: this.users.length,
        usersReady: this.users.filter(x => x.status === 'ready').length,
        usersWaiting: this.users.filter(x => x.status === 'waiting').length,
    }
}

Room.prototype.userJoin = function(user) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this
    this.users.push( user )
    user.lastSpellMoment = null
    user.color = COLORS[ _.random(0, COLORS.length - 1) ]
    COLORS = COLORS.filter(x => x !== user.color)

    console.log(`SocketIO :: ${this.name} :: User joined :: ${user.id}`)
    user.socket.emit('myuser_joined_room', { room: this.info(), user: user.info() })
    this.emit('user_joined_room', this.info())

    // User events
    user.socket.on('user_ready', (message) => {
        if(this.gameIsRunning) return

        if(user.status !== 'ready') {
            console.log(`SocketIO :: ${this.name} :: Player ready :: ${JSON.stringify(message)}`)
            user.status = 'ready'
            this.emit('user_ready', { user: user.id })
        }
    })
    user.socket.on('user_waiting', (message) => {
        if(this.gameIsRunning) return

        if(user.status !== 'waiting') {
            console.log(`SocketIO :: ${this.name} :: Player waiting :: ${JSON.stringify(message)}`)
            user.status = 'waiting'
            this.emit('user_waiting', { user: user.id })
        }
    })

    // Player events
    user.socket.on('player_move', (message) => {
        if(!this.gameIsRunning) return
        console.log(`SocketIO :: ${this.name} :: Player move :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') user.player.setPositionToGo(message.position)
    })

    user.socket.on('player_spell_fireball', (message) => {
        if(!this.gameIsRunning) return

        if(user.lastSpellMoment && moment().diff(user.lastSpellMoment) < FIREBALL_CD) return
        user.lastSpellMoment = moment()

        console.log(`SocketIO :: ${this.name} :: Player used fireball :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') gameObjectController.createFireball(message)
    })

    // Game events
    user.socket.on('game_start', (message) => {
        if(this.gameIsRunning) return
        console.log(`SocketIO :: ${this.name} :: Game start :: ${JSON.stringify(message)}`)
        if(this.owner.id !== user.id) return

        this.startGame(message)
    })

    user.socket.on('game_restart', (message) => {
        console.log(`SocketIO :: ${this.name} :: Game restarted :: ${JSON.stringify(message)}`)
        if(this.owner.id !== message.id) return


    })

}

Room.prototype.userDisconnect = function (user) {
    COLORS.push( user.color )

    this.gameObjectController.destroyPlayer(user.id)
    this.users = this.users.filter(x => x.id !== user.id)
}

Room.prototype.userOwner = function (user) {
    this.owner = user
}

Room.prototype.startGame = function (data) {
    const usersReady = this.users.every(x => x.status === 'ready')
    if(usersReady) {
        this.gameObjectController.start(this.users)
        this.mapController.start(data && data.map)

        this.emit('game_will_start', { time: DELAY_TO_START, map: this.mapController.info() })

        setTimeout(() => {
            this.users.forEach(u => u.socket.emit('player_create', u.player.info()))
            this.emit('map_create', this.mapController.info())

            this.gameIsRunning = true
            this.now = moment()
            this.gameLoop()

            this.emit('game_start')
        }, DELAY_TO_START)
    }
}

Room.prototype.endGame = function () {
    this.gameObjectController.end(this.users)
    this.mapController.end()

    this.users.forEach(u => u.status = 'waiting')

    this.emit('game_end')

    this.gameIsRunning = false
    this._gameEnded = false
}

Room.prototype.gameLoop = function () {
    const {
        gameObjectController,
        mapController,
        physics
    } = this

    if(!this.gameIsRunning) return

    let deltatime = this.now.diff() / 1000 * -1
    if(deltatime === 0) deltatime = .0001

    physics.update(deltatime)
    gameObjectController.update(deltatime)
    mapController.update(deltatime)

    const infos = gameObjectController.allInfos()
    this.emit('sync', infos)

    this.now = moment()
    setTimeout(this.gameLoop.bind(this), 10)
    
    if(this._gameEnded) return

    const alivePlayers = infos.players.filter(x => x.status === 'alive')
    if(alivePlayers.length === 1) {
        this._gameEnded = true
        this.emit('game_will_end', { time: DELAY_TO_END, winner: alivePlayers[0] })
        setTimeout(this.endGame.bind(this), DELAY_TO_END)
    }
}

Room.prototype.emit = function(name, data) {
    const emitData = data || {}
    emitData.sendTime = moment().toISOString()

    // this.socketIo.emit(name, emitData)
    this.users.forEach(u => u.socket.emit(name, emitData))
}

module.exports = Room
