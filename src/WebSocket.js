const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')
const GameObjectController = require('./GameObjectController')
const Physics = require('./Physics')
const MapController = require('./MapController')

let socketIo = null

gameObjectController = new GameObjectController(socketIo)
mapController = new MapController(gameObjectController)
physics = new Physics(gameObjectController)

let now = moment()
function gameLoop() {

    let deltatime = now.diff() / 1000 * -1
    if(deltatime === 0) deltatime = .0001

    physics.update(deltatime)
    gameObjectController.update(deltatime)
    mapController.update(deltatime)

    now = moment()

}

const connect = function(server) {
    socketIo = io.listen(server)
    gameObjectController.socketIo = socketIo

    let iteractions = 0
    setInterval(() => {
        gameLoop()
        if(++iteractions % 4) {
            socketIo.emit('sync', gameObjectController.allInfos())
        }
    }, 30)

    socketIo.on('connection', function(socket){
        const id = gameObjectController.createPlayer()
        console.log(`SocketIO :: New user created :: ${id}`)

        socket.emit('created', { id })
        socket.emit('map', mapController.info())

        socket.on('move', function (message) {
            console.log(`SocketIO :: Player move :: ${JSON.stringify(message)}`)
            const user = gameObjectController.gameObjects.find(x => x.id === message.id)
            if(user) user.setPositionToGo(message.position)
        })

        socket.on('fireball', function (message) {
            console.log(`SocketIO :: Player used fireball :: ${JSON.stringify(message)}`)
            gameObjectController.createFireball(message)
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: Player disconnect :: ${id}`)
            gameObjectController.destroyPlayer(id)
        })

    })
}

module.exports = {
    connect,
}
