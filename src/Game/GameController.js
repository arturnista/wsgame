const express = require('express')
const server = express()
const http = require('http')
const io = require('socket.io')
const _ = require('lodash')
const uuid = require('uuid')
const Room = require('./Room')
const User = require('./User')
const spells = require('./GameObjects/spells')

const INITIAL_PORT = 5001

const generateId = (function() {
    let socketId = 0
    return function() { return socketId++ }
})()

const nextPort = (function() {
    let port = 0
    return function() { 
        port = (port + 1) % 1000
        return INITIAL_PORT + port
    }
})()

let socketIo = null
let rooms = []

const createRoom = (roomData) => {
    const server = express()
    const roomHttp = http.Server(server)
    let room = null

    server.get('/', function(req, res, next) {
        res.status(200).json(room.info())
    })

    const roomPort = nextPort()
    roomHttp.listen(roomPort)
    room = socketConnect(roomHttp, roomData)

    // Keep track of the open sockets
    roomHttp.on('connection', function (socket) {
        if(!roomHttp.sockets) roomHttp.sockets = {}
        socket.id = generateId()
        roomHttp.sockets[socket.id] = socket
        socket.on('close', function (socket) {
            delete roomHttp.sockets[socket.id]
        })
    })    

    // If the room do not have any user in 3s
    setTimeout(() => {
        if(room.users.length === 0) deleteRoom(room)
    }, 3000)

    return {
        id: room.id,
        port: roomPort
    }
}

const deleteRoom = (room) => {
    room.server.close()
    // Close all the open sockets. If a socket is left open, the server is not closed
    for(const k in room.server.sockets) room.server.sockets[k].destroy()
    
    room.delete()

    rooms = rooms.filter(r => r.id !== room.id)
}

const socketConnect = function(server, data) {    
    console.log(`SocketIO :: Room created ${data.name} :: ${server.address().port}`)
    socketIo = io.listen(server)

    const room = new Room(data, server, socketIo)
    rooms.push(room)
    let users = []    

    socketIo.on('connection', function(socket) {
        const userId = socket.request._query.user_id
        const name = socket.request._query.name
        if(users.find(x => x.id === userId) != null) {
            socket.disconnect()
            return
        }
        
        let user = new User({ id: userId, name }, socket, isGuest => {
            console.log(`SocketIO :: User connected :: ${user.id}`)
            
            if(_.isNil(room.owner)) room.userOwner(user)
            room.userJoin(user)
        })

        users.push( user )

        socket.on('room_destroy', function (data) {
            console.log(`SocketIO :: User destroyed room :: ${user.id}`)
            if(room.owner.id !== user.id) return

            deleteRoom(room)
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: User disconnect :: ${user.id}`)
            room.userLeftRoom(user)
            if(user.id === room.owner.id) deleteRoom(room)
            else if(room.users.length === 0) deleteRoom(room)

            users = users.filter(x => x.id !== user.id)
        })

    })

    return room
}

function getRooms() {
    return rooms.map(x => x.info())
}

function getSpells() {
    return spells
}

module.exports = {
    createRoom,
    getRooms,
    getSpells
}