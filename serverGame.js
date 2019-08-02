const { createRoom } = require('./src/Game/GameController')

const {
    NAME,
    PORT
} = process.env

createRoom({
    name: NAME || 'NAMELESS SERVER'
}, {
    port: PORT || 5000
})