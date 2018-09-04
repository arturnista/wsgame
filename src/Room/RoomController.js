const express = require('express')
const server = express()
const http = require('http')
const io = require('socket.io')
const _ = require('lodash')
const uuid = require('uuid')
const Room = require('./Room')
const User = require('./User')
const spells = require('./GameObjects/spells')

let socketIo = null
let users = []
let rooms = []

const createRoom = (roomData) => {
    const server = express()
    const roomHttp = http.Server(server)

    server.get('/', function(req, res, next) {
        res.status(200).json({ ack: true })
    })

    const roomPort = Math.round(Math.random() * 999) + 5001
    roomHttp.listen(roomPort)
    const room = socketConnect(roomHttp, roomData)

    return {
        id: room.id,
        port: roomPort
    }
}

const deleteRoom = (room) => {
    room.server.close()
    room.delete()
}

const socketConnect = function(server, data) {
    socketIo = io.listen(server)
    
    console.log(`SocketIO :: Room created ${data.name} :: ${server.address().port}`)
    const room = new Room(data, server, socketIo)
    rooms.push(room)

    socketIo.on('connection', function(socket) {
        const userId = socket.request._query.user_id
        if(users.find(x => x.id === userId) != null) {
            socket.disconnect()
            return
        }
        
        let user = new User(userId, socket, isGuest => {
            console.log(`SocketIO :: User connected :: ${user.id}`)
            
            if(_.isNil(room.owner)) room.userOwner(user)
            room.userJoin(user)
        })

        users.push( user )

        socket.on('room_destroy', function (data) {
            console.log(`SocketIO :: User deleted room :: ${user.id}`)
            if(!room) return 
            if(room.owner.id !== user.id) return

            rooms = rooms.filter(r => {
                if(r.id === room.id) {
                    deleteRoom(r)
                    return false
                }
                return true
            })
        })

        socket.on('disconnect', function () {
            console.log(`SocketIO :: User disconnect :: ${user.id}`)
            if(room) room.userLeftRoom(user)

            users = users.filter(x => x.id !== user.id)
            rooms = rooms.filter(r => {
                if(r.users.length <= 0) {
                    deleteRoom(r)
                    return false
                }
                return true
            })
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
