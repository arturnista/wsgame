const _ = require('lodash')
const moment = require('moment')
const uuid = require('uuid')

function User(socket) {
    this.id = uuid.v4()
    this.player = {}

    this.socket = socket
    this.status = 'waiting'
}

User.prototype.info = function () {
    return {
        id: this.id,
        player: _.isEmpty(this.player) ? this.player : this.player.info(),
        status: this.status
    }
}

module.exports = User
