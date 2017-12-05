const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')
const User = require('./User')
let socketIo = null

let users = []

let now = moment()
function gameLoop() {
    let deltatime = now.diff() / 1000
    if(deltatime === 0) deltatime = .0001

    users.forEach(u => u.move(deltatime))
    now = moment()

    setImmediate(gameLoop)
}

const connect = function(server) {
    socketIo = io.listen(server)

    setInterval(() => {
        if(socketIo) socketIo.emit('sync', { players: users.map(x => x.info()) })
    }, 10)
    gameLoop()

    socketIo.on('connection', function(socket){
        const id = uuid.v4()
        users.push( new User(id) )
        console.log(`SocketIO :: New user created :: ${id}`)

        socket.emit('created', { id })

        socket.on('move', function (message) {
            console.log(`SocketIO :: User move :: ${message.id}`)
            const user = users.find(x => x.id === message.id)
            user.setPositionToGo(message.position)
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: User disconnect :: ${id}`)
            users = users.filter(x => x.id !== id)
        })

    })
}

module.exports = {
    connect,
}
