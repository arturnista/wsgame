const express = require('express')
const http = require('http')
const https = require('https')
const io = require('socket.io')
const _ = require('lodash')
const fs = require('fs')
const Room = require('./Room')
const User = require('./User')
const spells = require('./GameObjects/spells')
const figlet = require('figlet')

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

let rooms = []

const startCallback = function(port, local) {
    console.log('\n\n' + figlet.textSync('Game\nServer', 'Delta Corps Priest 1'));
    if(local) {
        console.log('\n\n' + figlet.textSync('Local', 'Delta Corps Priest 1'))
    }
}

const createRoom = (roomData, opt = {}) => {
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
    
        roomPort = opt.port ? opt.port : nextPort()
        roomHttp.listen(roomPort, () => startCallback(roomPort))

    } else {
        
        roomPort = roomHttp.address().port
        roomHttp.isLocal = true
        
        startCallback(roomPort, true)
        
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
        port: roomPort,
        isBlockMode
    }
}

const deleteRoom = (room) => {
    rooms = rooms.filter(r => r.id !== room.id)
}

const socketConnect = function(server, data) {    

    console.log(`SocketIO :: Room created ${data.name} :: ${server.address().port}`)
    const socketIo = io.listen(server)

    const room = new Room(data, server, socketIo, deleteRoom)
    rooms.push(room)

    return room
}

function getRooms() {
    return rooms.map(x => x.info()).filter(x => !x.private)
}

function getSpells() {
    return spells.get()
}

module.exports = {
    createRoom,
    getRooms,
    getSpells
}
