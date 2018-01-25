const io = require('socket.io')
const _ = require('lodash')
const moment = require('moment')
const uuid = require('uuid')
const Room = require('./Room/Room')
const User = require('./Room/User')
const spells = require('./Room/GameObjects/spells')

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

        user.socket.emit('myuser_info', user.info())
        user.socket.emit('myuser_rooms', { rooms: getRooms() })
        user.socket.emit('myuser_spells', { spells })

        socket.on('room_create', function (data) {
            const checkRoom = rooms.find(x => x.name === data.name)
            if(checkRoom) return

            user.name = data.userName
            console.log(`SocketIO :: User created ${data.name} :: ${user.id}`)
            room = new Room(socketIo.to(data.name), data)
            rooms.push(room)

            room.userOwner(user)
            room.userJoin(user)
            user.socket.join(room.name)
        })

        socket.on('room_join', function (data) {
            room = rooms.find(x => x.name === data.name)
            if(!room) return

            user.name = data.userName
            console.log(`SocketIO :: User joined ${data.name} :: ${user.id}`)
            room.userJoin(user)
            user.socket.join(room.name)
        })

        socket.on('room_left', function (data) {
            console.log(`SocketIO :: User left room :: ${user.id}`)
            if(room) room.userDisconnect(user)

            users = users.filter(x => x.id !== user.id)
            rooms = rooms.filter(r => {
                if(r.users.length <= 0) {
                    r.delete()
                    return false
                }
                return true
            })
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: User disconnect :: ${user.id}`)
            if(room) room.userDisconnect(user)

            users = users.filter(x => x.id !== user.id)
            rooms = rooms.filter(r => {
                if(r.users.length <= 0) {
                    r.delete()
                    return false
                }
                return true
            })
        })

    })

}

function getRooms() {
    return rooms.map(x => x.info())
}

function getSpells() {
    return spells
}

module.exports = {
    connect,
    getRooms,
    getSpells
}
