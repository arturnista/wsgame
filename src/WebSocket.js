const ws = require('ws')
const io = require('socket.io')
const moment = require('moment')
const User = require('./User')
let socketIo = null

let users = []
users.push( new User('1') )
users.push( new User('2') )
users.push( new User('3') )

let now = moment()
function gameLoop() {
    let deltatime = now.diff() / 1000
    if(deltatime === 0) deltatime = .0001

    users.forEach(u => u.move(deltatime))
    now = moment()

    setImmediate(gameLoop)
}
gameLoop()

setInterval(() => {
    socketIo.emit('sync', { players: users.map(x => x.info()) })
}, 100)

const connect = function(server) {
    socketIo = io.listen(server)

    socketIo.on('connection', function(socket){
        console.log('a user connected')

        socket.on('move', function (message) {
            const user = users.find(x => x.id === message.id)
            user.setPositionToGo(message.position)
        })

    })
}

module.exports = {
    connect,
}
