const ws = require('ws')
let websocket = null

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
