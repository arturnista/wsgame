const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')

const GameObjectController = require('./GameObjectController')
gameObjectController = new GameObjectController()

const Physics = require('./Physics')
physics = new Physics(gameObjectController)

let socketIo = null

let now = moment()
function gameLoop() {

    let deltatime = now.diff() / 1000 * -1
    if(deltatime === 0) deltatime = .0001

    physics.update(deltatime)
    gameObjectController.update(deltatime)

    now = moment()

}

const connect = function(server) {
    socketIo = io.listen(server)

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

        socket.on('move', function (message) {
            console.log(`SocketIO :: Player move :: ${message.id}`)
            const user = gameObjectController.gameObjects.find(x => x.id === message.id)
            if(user) user.setPositionToGo(message.position)
        })

        socket.on('fireball', function (message) {
            console.log(`SocketIO :: Player used fireball :: ${message.id}`)
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
