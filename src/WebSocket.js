const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')

const Fireball = require('./Fireball')
const Player = require('./Player')
let socketIo = null

let gameObjects = []

let now = moment()
function gameLoop() {
    
    let deltatime = now.diff() / 1000 * -1
    if(deltatime === 0) deltatime = .0001

    gameObjects.forEach(u => u.update(deltatime))
    now = moment()

}

const connect = function(server) {
    socketIo = io.listen(server)

    setInterval(() => {
        gameLoop()
        socketIo.emit('sync', {
            players: gameObjects.filter(x => x.type === goTypes.PLAYER).map(x => x.info()),
            spells: gameObjects.filter(x => x.type === goTypes.SPELL).map(x => x.info()),
        })
    }, 10)

    socketIo.on('connection', function(socket){
        const id = uuid.v4()
        gameObjects.push( new Player(id, gameObjects) )
        console.log(`SocketIO :: New user created :: ${id}`)

        socket.emit('created', { id })

        socket.on('move', function (message) {
            console.log(`SocketIO :: Player move :: ${message.id}`)
            const user = gameObjects.find(x => x.id === message.id)
            if(user) user.setPositionToGo(message.position)
        })

        socket.on('fireball', function (message) {
            console.log(`SocketIO :: Player used fireball :: ${message.id}`)
            gameObjects.push( new Fireball(id, message, gameObjects) )
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: Player disconnect :: ${id}`)
            gameObjects = gameObjects.filter(x => x.id !== id && (x.owner == null || x.owner.id !== id))
        })

    })
}

module.exports = {
    connect,
}
