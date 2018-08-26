const _ = require('lodash')
const uuid = require('uuid')
const spells = require('./GameObjects/spells')

function User(socket) {
    this.id = uuid.v4()

    this.socket = socket

    this.reset()
    this.restart()
}

User.prototype.reset = function() {
    this.player = {}
    
    this.status = 'waiting'
    this.spells = []
    this.fixedSpells = []
    this.winCount = 0
    this.isObserver = false
}

User.prototype.restart = function() {
    this.player = {}
    this.spells = this.spells.length === 0 ? _.clone(this.fixedSpells) : this.spells
}

User.prototype.info = function () {
    return {
        id: this.id,
        name: this.name,
        player: _.isNil(this.player) || _.isEmpty(this.player) || _.isNil(this.player.info) ? this.player : this.player.info(),
        color: this.color,
        status: this.status,
        winCount: this.winCount,
        spells: this.spells,
        isObserver: this.isObserver,
    }
}

User.prototype.selectSpell = function (name) {
    if(!spells[name]) return false
    if(this.spells.indexOf(name) !== -1) return false

    const offensiveSpells = this.spells.filter(x => spells[x].type === 'offensive')
    const supportSpells = this.spells.filter(x => spells[x].type === 'support')

    if(spells[name].type === 'offensive' && offensiveSpells.length >= spells._config.MAX_OFFENSIVE) return false
    if(spells[name].type === 'support' && supportSpells.length >= spells._config.MAX_SUPPORT) return false
    this.spells.push(name)
    return spells[name]
}

User.prototype.deselectSpell = function (name) {
    if(this.fixedSpells.indexOf(name) !== -1) return false

    this.spells = this.spells.filter(x => x !== name)
    return true
}

module.exports = User
