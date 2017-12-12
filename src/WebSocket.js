const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')
const Room = require('./Room/Room')

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

const connect = function(server) {
    socketIo = io.listen(server)

    socketIo.on('connection', function(socket) {
        let room = new Room(socketIo)
        room.userConnect(socket)

        socket.on('disconnect', function () {
            console.log(`SocketIO :: Player disconnect :: ${id}`)
            room.userDisconnect()
        })

    })

}

module.exports = {
    connect,
}
