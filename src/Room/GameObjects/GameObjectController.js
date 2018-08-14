const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')

const Fireball = require('./Fireball')
const Follower = require('./Follower')
const Boomerang = require('./Boomerang')
const TeleportationOrb = require('./TeleportationOrb')
const Prison = require('./Prison')
const PoisonDagger = require('./PoisonDagger')
const VoodooDoll = require('./VoodooDoll')
const Bubble = require('./Bubble')
const Player = require('./Player')
const Obstacle = require('./Obstacle')

const BOT_COLORS = [
    '#4A148C',
    '#00695C',
    '#388E3C'
]

function GameObjectController(addState) {
    this.addState = addState
    this.gameObjects = []
}

GameObjectController.prototype.start = function (users, { addState, mapController, botCount }) {

    const players = []

    this.gameObjects = []
    for (let i = 0; i < users.length; i++) {
        if(users[i].isObserver) continue

        users[i].player = this.createPlayer({ addState, mapController })
        users[i].player.color = users[i].color
        users[i].player.spells = users[i].spells
        users[i].player.user = users[i]
        users[i].player.name = users[i].name
        players.push(users[i].player)
    }

    for (let i = 0; i < botCount; i++) {
        let player = this.createPlayer({ isBot: true, addState, mapController })
        player.color = BOT_COLORS[_.random(0, BOT_COLORS.length - 1)]
        player.name = 'Bot Ulysses'
        players.push(player)
    }
    
    players.forEach(p => this.create(p))
    return players
}

GameObjectController.prototype.end = function (users) {

    this.gameObjects = []
    for (let i = 0; i < users.length; i++) {
        if(users[i].player.status === 'alive') users[i].winCount += 1
        users[i].restart()
    }

}

GameObjectController.prototype.allInfos = function () {

    return {
        players: this.gameObjects.filter(x => goTypes.isType(x.type, goTypes.PLAYER)).map(x => x.info()),
        spells: this.gameObjects.filter(x => goTypes.isType(x.type, goTypes.SPELL)).map(x => x.info()),
    }

}

GameObjectController.prototype.update = function (deltatime) {

    this.gameObjects.forEach(u => u.update(deltatime))

}

GameObjectController.prototype.createPlayer = function (opt) {
    const player = new Player(opt, this)
    return player
}

GameObjectController.prototype.createFireball = function (data) {
    const fireball = new Fireball(data, this)
    this.create(fireball)

    return fireball
}

GameObjectController.prototype.createFollower = function (data) {
    const follower = new Follower(data, this)
    this.create(follower)

    return follower
}

GameObjectController.prototype.createBoomerang = function (data) {
    const boomerang = new Boomerang(data, this)
    this.create(boomerang)

    return boomerang
}

GameObjectController.prototype.createPoisonDagger = function (data) {
    const poisonDagger = new PoisonDagger(data, this)
    this.create(poisonDagger)

    return poisonDagger
}

GameObjectController.prototype.createVoodooDoll = function (data) {
    const voodooDoll = new VoodooDoll(data, this)
    this.create(voodooDoll)

    return voodooDoll
}

GameObjectController.prototype.createBubble = function (data) {
    const bubble = new Bubble(data, this)
    this.create(bubble)

    return bubble
}

GameObjectController.prototype.createTeleportationOrb = function (data) {
    const telOrb = new TeleportationOrb(data, this)
    this.create(telOrb)

    return telOrb
}

GameObjectController.prototype.createPrison = function (data) {
    const prison = new Prison(data, this)
    this.create(prison)

    return prison
}

GameObjectController.prototype.createObstacle = function (position) {
    const obs = new Obstacle(position, this)
    this.create(obs, { supressEmit: true })

    return obs
}

GameObjectController.prototype.create = function(entity, { supressEmit } = {}) {
    this.gameObjects.push(entity)
    entity.exists = true
    if(!supressEmit) this.addState('entity_created', entity.info())
}

GameObjectController.prototype.destroy = function (gameObject) {
    if(typeof gameObject === 'string') {
        gameObject = { id: gameObject }
    }
    let goDeleted = null
    this.gameObjects = this.gameObjects.filter(x => {
        if(x.id === gameObject.id) goDeleted = x
        return x.id !== gameObject.id
    })

    if(goDeleted) {
        this.addState('entity_deleted', goDeleted.info())
        goDeleted.exists = false
    }
}

GameObjectController.prototype.destroyPlayer = function (id) {
    this.gameObjects = this.gameObjects.filter(x => x.id !== id)
}

module.exports = GameObjectController
