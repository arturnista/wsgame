const io = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')
const Room = require('./Room/Room')
const User = require('./Room/User')

let socketIo = null
let users = []
let rooms = []

const connect = function(server) {
    socketIo = io.listen(server)

    socketIo.on('connection', function(socket) {
        let room = null
        let user = new User(socket)
        users.push( user )

        socket.on('room_create', function (data) {
            console.log(`SocketIO :: User created ${data.name} :: ${id}`)
            room = new Room(socketIo, data)
            room.userJoin(user)
            room.userOwner(user)
            rooms.push(room)
        })

        socket.on('room_join', function (data) {
            console.log(`SocketIO :: User joined ${data.name} :: ${id}`)
            room = rooms.find(x => x.name === data.name)
            room.userJoin(user)
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: User disconnect :: ${id}`)
            if(room) room.userDisconnect(user)
            users = users.filter(x => x.id !== user.id)
        })

    })

}

module.exports = {
    connect,
}
