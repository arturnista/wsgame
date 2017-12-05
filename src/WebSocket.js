const ws = require('ws')
const moment = require('moment')
const User = require('./User')
let websocket = null

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

    // if(websocket) {
    //     websocket.clients.forEach(client => {
    //         if (client.readyState !== ws.OPEN) return
    //         client.send(JSON.stringify({
    //             type: 'sync',
    //             players: users.map(x => x.info())
    //         }))
    //     })
    // }

    setImmediate(gameLoop)
}
gameLoop()

setInterval(() => {
    websocket.clients.forEach(client => {
        if (client.readyState !== ws.OPEN) return
        client.send(JSON.stringify({
            type: 'sync',
            players: users.map(x => x.info())
        }))
    })
}, 100)

const connect = function(server) {
    websocket = new ws.Server({server})

    websocket.on('connection', (ws) => {
        ws.on('message', (rawMsg) => {
            let msg = JSON.parse(rawMsg)
            handleMessage(msg, ws)
        })

        ws.on('close', () => {
            return handleClose(ws)
        })
    })
}

const handleMessage = function(message, client) {

    switch(message.type) {
        case 'ready':
            console.log('WS Type: ', message.type)
            break
        case 'move':
            const user = users.find(x => x.id === message.id)
            user.setPositionToGo(message.position)
            break
        default:
            console.log('WS Type: ', message.type)
    }

}

const handleError = function(err, client) {
    client.send(Object.assign({}, err, { type: 'error' }))
}

const handleClose = function(client) {

}

module.exports = {
    connect,
    handleMessage,
    handleError,
    handleClose
}
