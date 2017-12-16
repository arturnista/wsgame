const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjectController')
const Physics = require('./Physics')
const MapController = require('./MapController')

const DELAY_TO_START = 3000
const DELAY_TO_END = 5000

function Room(socketIo, data) {
    this.now = moment()
    this.name = data.name

    this.socketIo = socketIo

    this.gameObjectController = new GameObjectController(socketIo)
    this.mapController = new MapController(this.gameObjectController, socketIo)
    this.physics = new Physics(this.gameObjectController)

    this.gameIsRunning = false
    this._gameEnded = false
    this.users = []
    this.owner = null
}

Room.prototype.info = function () {
    return {
        name: this.name
    }
}

Room.prototype.userJoin = function(user) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this
    this.users.push( user )

    console.log(`SocketIO :: ${this.name} :: User joined :: ${user.id}`)
    user.socket.emit('user_joined_room', this.info())

    // User events
    user.socket.on('user_ready', (message) => {
        console.log(`SocketIO :: ${this.name} :: Player ready :: ${JSON.stringify(message)}`)
        user.status = 'ready'
    })

    // Player events
    user.socket.on('player_move', (message) => {
        console.log(`SocketIO :: ${this.name} :: Player move :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') user.player.setPositionToGo(message.position)
    })

    user.socket.on('player_spell_fireball', (message) => {
        console.log(`SocketIO :: ${this.name} :: Player used fireball :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') gameObjectController.createFireball(message)
    })

    // Game events
    user.socket.on('game_start', (message) => {
        console.log(`SocketIO :: ${this.name} :: Game start :: ${JSON.stringify(message)}`)
        console.log(this.users)
        if(this.owner.id !== user.id) return

        this.startGame()
    })

    user.socket.on('game_restart', (message) => {
        console.log(`SocketIO :: ${this.name} :: Game restarted :: ${JSON.stringify(message)}`)
        if(this.owner.id !== message.id) return


    })

}

Room.prototype.userDisconnect = function (user) {
    this.gameObjectController.destroyPlayer(user.id)
    this.users = this.users.filter(x => x.id !== user.id)
}

Room.prototype.userOwner = function (user) {
    this.owner = user
}

Room.prototype.startGame = function () {
    const usersReady = this.users.every(x => x.status === 'ready')
    if(usersReady) {
        this.socketIo.emit('game_will_start', { time: DELAY_TO_START })

        setTimeout(() => {
            this.gameObjectController.start(this.users)
            this.mapController.start()

            this.users.forEach(u => u.socket.emit('player_create', u.player.info()))
            this.socketIo.emit('map_create', this.mapController.info())

            this.gameIsRunning = true
            this.now = moment()
            this.gameLoop()

            this.socketIo.emit('game_start')
        }, DELAY_TO_START)
    }
}

Room.prototype.endGame = function () {
    this.gameObjectController.end()
    this.mapController.end()

    this.users.forEach(u => u.status === 'waiting')

    this.socketIo.emit('game_end')    

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

    this.now = moment()
    setTimeout(this.gameLoop.bind(this), 10)
    const infos = gameObjectController.allInfos()
    this.socketIo.emit('sync', infos)

    if(this._gameEnded) return
    
    const alivePlayers = infos.players.filter(x => x.status === 'alive')
    // if(alivePlayers.length === 1) {
    //     this._gameEnded = true
    //     this.socketIo.emit('game_will_end', { time: DELAY_TO_END, winner: alivePlayers[0] })
    //     setTimeout(this.endGame.bind(this), DELAY_TO_END)
    // }
}

module.exports = Room
