const _ = require('lodash')
const moment = require('moment')
const uuid = require('uuid')

function User(socket) {
    this.id = uuid.v4()
    this.player = {}

    this.socket = socket
    this.status = 'waiting'
    this.spells = []
}

User.prototype.info = function () {
    return {
        id: this.id,
        name: this.name,
        player: _.isEmpty(this.player) ? this.player : this.player.info(),
        color: this.color,
        status: this.status,
    }
}

module.exports = User
