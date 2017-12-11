const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjectController')
const Physics = require('./Physics')
const MapController = require('./MapController')

let ITERATIONS = 4

for (var i = 0; i < process.argv.length; i++) {
    const param = process.argv[i].split('=')
    const [ key, value ] = param
    const valueInt = parseInt(value)

    if(isNaN(valueInt)) continue

    switch (key) {
        case '-i':
            ITERATIONS = valueInt + 1
            break
    }
}

let socketIo = null

gameObjectController = new GameObjectController(socketIo)
mapController = new MapController(gameObjectController, socketIo)
physics = new Physics(gameObjectController)

let now = moment()
function gameLoop() {

    let deltatime = now.diff() / 1000 * -1
    if(deltatime === 0) deltatime = .0001

    physics.update(deltatime)
    gameObjectController.update(deltatime)
    mapController.update(deltatime)

    now = moment()
    setTimeout(gameLoop, 10)
    socketIo.emit('sync', gameObjectController.allInfos())
}

const connect = function(server) {
    socketIo = io.listen(server)
    gameObjectController.socketIo = socketIo
    mapController.socketIo = socketIo

    socketIo.on('connection', function(socket){
        const id = gameObjectController.createPlayer()

        socket.on('game_restart', function (message) {
            console.log(`SocketIO :: Game restarted :: ${JSON.stringify(message)}`)
            gameObjectController.restart()
            mapController.restart()
            socketIo.emit('map_update', mapController.info())
        })

        console.log(`SocketIO :: New user created :: ${id}`)

        socket.emit('map_create', mapController.info())
        
        socket.emit('player_create', { id })
        socket.on('player_move', function (message) {
            console.log(`SocketIO :: Player move :: ${JSON.stringify(message)}`)
            const user = gameObjectController.gameObjects.find(x => x.id === message.id)
            if(user) user.setPositionToGo(message.position)
        })

        socket.on('player_spell_fireball', function (message) {
            console.log(`SocketIO :: Player used fireball :: ${JSON.stringify(message)}`)
            gameObjectController.createFireball(message)
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: Player disconnect :: ${id}`)
            gameObjectController.destroyPlayer(id)
        })

    })

    setImmediate(gameLoop)
}

module.exports = {
    connect,
}
