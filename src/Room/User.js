const _ = require('lodash')
const uuid = require('uuid')
const spells = require('./GameObjects/spells')
const Users = require('../Users/iate')

function User(socket) {
    this.socket = socket
    
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

    this.reset()
    this.restart()
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
    this.spells = this.spells.filter(x => x !== name)
    return true
}

module.exports = User
