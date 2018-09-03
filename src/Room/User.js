const _ = require('lodash')
const uuid = require('uuid')
const spells = require('./GameObjects/spells')
const Users = require('../Users/iate')

function User(socket) {
    this.socket = socket

    this.reset()
    this.restart()
    
    this.socket.on('user_guest', (data, callback) => {
        console.log(`SocketIO :: User guest defined :: ${data.id}`)

        this.id = uuid.v4()
        this.name = 'Guest Player'
        this.spells = []

        callback({ id: this.id, config: { name: this.name, spells: this.spells, hotkeys: ['q', 'w', 'e'] } })
    })
    
    this.socket.on('user_define', (data, callback) => {
        console.log(`SocketIO :: User defined :: ${data.id}`)
        this.id = data.id
        Users.interactor.getOne(this.id)
        .then(result => {

            this.id = result.id
            this.name = result.config.name
            this.spells = result.config.spells
            
            callback(result)
        })
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
    return Users.interactor.updateConfig(this.id, { spells: this.spells })
}

module.exports = User
