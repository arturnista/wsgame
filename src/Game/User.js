const _ = require('lodash')
const uuid = require('uuid')
const spells = require('./GameObjects/spells')
const Users = require('../Users/iate')

function User({ id, name }, socket, connectionReadyCallback) {
    this.socket = socket
    this.id = id

    this.reset()
    this.restart()

    this.isGuest = false

    Users.interactor.getOne(this.id)
    .then(result => {

        this.id = result.id
        this.name = result.preferences.name
        this.spells = result.preferences.spells
        this.isGuest = false

        connectionReadyCallback(this)
        
    })
    .catch(e => {

        this.id = id
        this.name = name
        this.spells = []
        this.isGuest = true

        connectionReadyCallback(this)

    })
}

User.prototype.reset = function() {
    this.player = {}
    
    this.status = 'waiting'
    this.spells = []
    this.winCount = 0
    this.isObserver = false
}

User.prototype.restart = function() {
    this.player = {}
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

User.prototype.selectSpell = function (message) {
    const name = message.spellName
    const position = message.position

    if(!spells[name]) return false
    if(_.findIndex(this.spells, x => x.id === name) !== -1) return false

    const offensiveSpells = this.spells.filter(x => spells[x.id].type === 'offensive')
    if(spells[name].type === 'offensive' && offensiveSpells.length >= spells._config.MAX_OFFENSIVE) return false

    const supportSpells = this.spells.filter(x => spells[x.id].type === 'support')
    if(spells[name].type === 'support' && supportSpells.length >= spells._config.MAX_SUPPORT) return false

    this.spells.push({ id: name, position })
    return spells[name]
}

User.prototype.deselectSpell = function (message) {
    const name = message.spellName
    this.spells = this.spells.filter(x => x.id !== name)
    return true
}

User.prototype.saveSpells = function() {
    if(this.isGuest) return Promise.resolve()
    return Users.interactor.updatePreferences(this.id, { spells: this.spells })
}

User.prototype.saveGame = function(isWinner, users) {
    if(this.isGuest) return Promise.resolve()
    return Promise.resolve()
}

module.exports = User
