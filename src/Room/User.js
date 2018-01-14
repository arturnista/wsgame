const _ = require('lodash')
const moment = require('moment')
const uuid = require('uuid')
const spells = require('./GameObjects/spells')

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
        player: _.isNil(this.player) || _.isEmpty(this.player) || _.isNil(this.player.info) ? this.player : this.player.info(),
        color: this.color,
        status: this.status,
    }
}

User.prototype.selectSpell = function (name) {
    if(!spells[name]) return null

    const offensiveSpells = this.spells.filter(x => spells[x].type === 'offensive')
    const defensiveSpells = this.spells.filter(x => spells[x].type === 'defensive')

    if(spells[name].type === 'offensive' && offensiveSpells.length >= spells._config.MAX_OFFENSIVE) return false
    if(spells[name].type === 'defensive' && defensiveSpells.length >= spells._config.MAX_DEFENSIVE) return false

    this.spells.push(name)
    return spells[name]
}

User.prototype.deselectSpell = function (name) {
    this.spells = this.spells.filter(x => x !== name)
}

module.exports = User
