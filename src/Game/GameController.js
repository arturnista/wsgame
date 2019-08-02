const express = require('express')
const server = express()
const http = require('http')
const https = require('https')
const io = require('socket.io')
const _ = require('lodash')
const uuid = require('uuid')
const fs = require('fs')
const Room = require('./Room')
const User = require('./User')
const spells = require('./GameObjects/spells')

const INITIAL_PORT = 5001
const MAX_ROOMS = process.env.MAX_ROOMS ? parseInt(process.env.MAX_ROOMS) : 1000

const generateId = (function() {
    let socketId = 0
    return function() { return socketId++ }
})()

const nextPort = (function() {
    let port = 0
    return function() { 
        port = (port + 1) % MAX_ROOMS
        return INITIAL_PORT + port
    }
})()

let socketIo = null
let rooms = []

const createRoom = (roomData, opt) => {
    let roomPort = null
    let room = null
    let roomHttp = opt.server
    const isBlockMode = opt.isBlockMode

    if(!roomHttp) {

        const server = express()
        if(process.env.PROTOCOL === 'HTTP') {

            roomHttp = http.Server(server)

        } else {

            const sslOptions = {
                key: fs.readFileSync('./ssl/server.key'),
                cert: fs.readFileSync('./ssl/cert.crt'),
                ca: [fs.readFileSync('./ssl/gd1.cert', 'utf8'),
                    fs.readFileSync('./ssl/gd2.cert', 'utf8')]
            }
            roomHttp = https.Server(sslOptions, server)

        }
    
        server.get('/', function(req, res, next) {
            res.status(200).json(room.info())
        })
    
        roomPort = nextPort()
        roomHttp.listen(roomPort)

    } else {
        
        roomPort = roomHttp.address().port
        roomHttp.isLocal = true
        
    }

    room = socketConnect(roomHttp, roomData)

    // Keep track of the open sockets
    roomHttp.on('connection', function (socket) {
        if(!roomHttp.sockets) roomHttp.sockets = {}
        socket.id = generateId()
        roomHttp.sockets[socket.id] = socket
        socket.on('close', function (closeSocket) {
            delete roomHttp.sockets[socket.id]
        })
    })    

    // If the room do not have any user in 3s
    setTimeout(() => {
        if(room.users.length === 0) deleteRoom(room)
    }, 15000)

    room.isBlockMode = isBlockMode

    return {
        id: room.id,
        port: roomPort
    }
}

const deleteRoom = (room) => {
    if(!room.server.isLocal) {
        room.server.close()
        // Close all the open sockets. If a socket is left open, the server is not closed
        // for(const k in room.server.sockets) room.server.sockets[k].destroy()
    }
    
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
            if(room && user.id === room.owner.id) deleteRoom(room)
            else if(room.users.length === 0) deleteRoom(room)

            users = users.filter(x => x.id !== user.id)
        })

    })

    return room
}

function getRooms() {
    return rooms.map(x => x.info()).filter(x => !x.private)
}

function getSpells() {
    return spells
}

module.exports = {
    createRoom,
    getRooms,
    getSpells
}
