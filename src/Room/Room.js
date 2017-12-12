const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjectController')
const Physics = require('./Physics')
const MapController = require('./MapController')

function Room(socketIo) {
    this.now = moment()

    this.gameObjectController = new GameObjectController(socketIo)
    this.mapController = new MapController(this.gameObjectController, socketIo)
    this.physics = new Physics(this.gameObjectController)

    this.gameIsRunning = false
}

Room.prototype.userConnect = function(socket) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this
    const id = gameObjectController.createPlayer()

    socket.emit('map_create', mapController.info())

    socket.on('game_start', function (message) {
        console.log(`SocketIO :: Game start :: ${JSON.stringify(message)}`)
        const everybodyReady = gameObjectController.gameObjects.every(x => x.type === goTypes.PLAYER && x.status === 'ready')
        if(everybodyReady) {
            gameObjectController.start()
            mapController.start()

            this.gameIsRunning = true
            setImmediate(this.gameLoop.bind(this))

            socketIo.emit('map_update', mapController.info())
        }
    })
    socket.on('game_restart', function (message) {
        console.log(`SocketIO :: Game restarted :: ${JSON.stringify(message)}`)
        gameObjectController.restart()
        mapController.restart()
        socketIo.emit('map_update', mapController.info())
    })

    console.log(`SocketIO :: New user created :: ${id}`)

    socket.emit('player_create', { id })
    socket.on('player_move', function (message) {
        console.log(`SocketIO :: Player move :: ${JSON.stringify(message)}`)
        const player = gameObjectController.gameObjects.find(x => x.id === message.id)
        if(player) player.setPositionToGo(message.position)
    })
    socket.on('player_ready', function (message) {
        console.log(`SocketIO :: Player ready :: ${JSON.stringify(message)}`)
        const player = gameObjectController.gameObjects.find(x => x.id === message.id)
        if(player) player.status = 'ready'
    })

    socket.on('player_spell_fireball', function (message) {
        console.log(`SocketIO :: Player used fireball :: ${JSON.stringify(message)}`)
        gameObjectController.createFireball(message)
    })
}

Room.prototype.userDisconnect = function () {
    this.gameObjectController.destroyPlayer(id)
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
