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

        console.log(`SocketIO :: User connected :: ${user.id}`)

        user.socket.emit('user_info', user.info())

        socket.on('room_create', function (data) {
            const checkRoom = rooms.find(x => x.name === data.name)
            if(checkRoom) return

            console.log(`SocketIO :: User created ${data.name} :: ${user.id}`)
            room = new Room(socketIo.to(data.name), data)
            rooms.push(room)

            room.userJoin(user)
            room.userOwner(user)
            user.socket.join(room.name)
        })

        socket.on('room_join', function (data) {
            room = rooms.find(x => x.name === data.name)
            if(!room) return

            console.log(`SocketIO :: User joined ${data.name} :: ${user.id}`)
            room.userJoin(user)
            user.socket.join(room.name)
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: User disconnect :: ${user.id}`)
            if(room) room.userDisconnect(user)

            users = users.filter(x => x.id !== user.id)
            rooms = rooms.filter(x => x.users.length > 0)
        })

    })

}

module.exports = {
    connect,
}
