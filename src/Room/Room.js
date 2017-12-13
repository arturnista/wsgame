const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjectController')
const Physics = require('./Physics')
const MapController = require('./MapController')

function Room(socketIo, data) {
    this.now = moment()
    this.name = data.name

    this.gameObjectController = new GameObjectController(socketIo)
    this.mapController = new MapController(this.gameObjectController, socketIo)
    this.physics = new Physics(this.gameObjectController)

    this.gameIsRunning = false
    this.users = []
    this.owner = null
}

Room.prototype.userJoin = function(user) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this
    this.users.push( user )

    console.log(`SocketIO :: ${this.name} :: User joined :: ${user.id}`)

    // User events
    user.socket.emit('user_info', user.info())
    user.socket.on('user_ready', function (message) {
        console.log(`SocketIO :: ${this.name} :: Player ready :: ${JSON.stringify(message)}`)
        user.status = 'ready'
    })

    // Player events
    user.socket.on('player_move', function (message) {
        console.log(`SocketIO :: ${this.name} :: Player move :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') user.player.setPositionToGo(message.position)
    })

    user.socket.on('player_spell_fireball', function (message) {
        console.log(`SocketIO :: ${this.name} :: Player used fireball :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') gameObjectController.createFireball(message)
    })

    // Game events
    user.socket.on('game_start', function (message) {
        console.log(`SocketIO :: ${this.name} :: Game start :: ${JSON.stringify(message)}`)
        if(this.owner.id !== message.id) return

        const usersReady = this.users.every(x => x.id === 'ready')
        if(usersReady) {
            gameObjectController.start()
            mapController.start()

            this.users.forEach(u => u.socket.emit('player_create', u.player.info()))
            user.socket.emit('map_create', mapController.info())

            this.gameIsRunning = true
            this.now = moment()
            this.gameLoop()
        }
    })
    user.socket.on('game_restart', function (message) {
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
    socketIo.emit('sync', gameObjectController.allInfos())
}

module.exports = Room
