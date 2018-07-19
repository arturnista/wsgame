const _ = require('lodash')
const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjects/GameObjectController')
const Physics = require('./Physics')
const MapController = require('./Map/MapController')

const DELAY_TO_START = 4000
const DELAY_TO_END = 5000
const FIXED_SPELLS = [ 'fireball' ]

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
    this.cycleTime = null
    this.users = []
    this.chat = []
    this.owner = null
}

Room.prototype.delete = function () {
    console.log(`SocketIO :: ${this.name} :: Deleted`)

    this.gameIsRunning = false
    this._gameEnded = false

    clearTimeout(this.cycleTime)

    this.gameObjectController.end(this.users)
    this.mapController.end()
}

Room.prototype.info = function () {
    return {
        name: this.name,
        owner: this.owner.info(),
        users: this.users.map(x => x.info()),
        chat: this.chat,
    }
}

Room.prototype.userJoin = function(user) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this
    this.users.push( user )

    user.color = _.sample(COLORS)
    user.spells = [ ...FIXED_SPELLS ]
    user.fixedSpells = [ ...FIXED_SPELLS ]
    user.gameObjectController = this.gameObjectController
    
    COLORS = COLORS.filter(x => x !== user.color)

    console.log(`SocketIO :: ${this.name} :: User joined :: ${user.id}`)
    user.socket.emit('myuser_joined_room', { room: this.info(), user: user.info() })
    this.emit('user_joined_room', { room: this.info(), user: user.info() })

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

    user.socket.on('user_select_spell', (message) => {
        if(this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player selected spell :: ${JSON.stringify(message)}`)
        const spellData = user.selectSpell(message.spellName)
        if(spellData) this.emit('user_selected_spell', { user: user.id, spellName: message.spellName, spellData })
    })

    user.socket.on('user_deselect_spell', (message) => {
        if(this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player deselected spell :: ${JSON.stringify(message)}`)
        const result = user.deselectSpell(message.spellName)
        if(result) this.emit('user_deselected_spell', { user: user.id, spellName: message.spellName })
    })

    user.socket.on('user_submit_message', (message) => {
        console.log(`SocketIO :: ${this.name} :: Player submit message :: ${JSON.stringify(message)}`)
        const user = this.users.find(x => x.id === message.user)
        this.chat.push({
            id: user.id,
            message: message.message,
            name: user.name,
            createdAt: moment().toISOString(),
        })
        this.emit('room_chat_new_message', { chat: this.chat })
    })

    // Player events
    user.socket.on('player_move', (message) => {
        if(!this.gameIsRunning) return
        console.log(`SocketIO :: ${this.name} :: Player move :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') user.player.setPositionToGo(message.position)
    })

    user.socket.on('player_spell_fireball', (message) => {
        if(!this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player used fireball :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell('fireball', message)
    })

    user.socket.on('player_spell_follower', (message) => {
        if(!this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player used follower :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell('follower', message)
    })

    user.socket.on('player_spell_boomerang', (message) => {
        if(!this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player used boomerang :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell('boomerang', message)
    })

    user.socket.on('player_spell_reflect_shield', (message) => {
        if(!this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player used reflect_shield :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell('reflect_shield', message)
    })

    user.socket.on('player_spell_blink', (message) => {
        if(!this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player used blink :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell('blink', message)
    })

    user.socket.on('player_spell_explosion', (message) => {
        if(!this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player used explosion :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell('explosion', message)
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

    if(user.player) this.gameObjectController.destroyPlayer(user.player.id)
    this.users = this.users.filter(x => x.id !== user.id)

    this.emit('user_left_room', user.info())
}

Room.prototype.userOwner = function (user) {
    this.owner = user
}

Room.prototype.startGame = function (data) {
    const usersReady = this.users.every(x => x.status === 'ready')
    if(usersReady) {
        this.gameObjectController.start(this.users, { emit: this.emit.bind(this), mapController: this.mapController, botCount: 0 })
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

    this.emit('game_end', { users: this.users.map(x => x.info()) })

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
    this.cycleTime = setTimeout(this.gameLoop.bind(this), 10)

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
