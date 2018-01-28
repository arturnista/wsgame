const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')

const Fireball = require('./Fireball')
const Follower = require('./Follower')
const Boomerang = require('./Boomerang')
const Player = require('./Player')
const Obstacle = require('./Obstacle')

const BOT_COLORS = [
    '#4A148C',
    '#00695C',
    '#388E3C'
]

function GameObjectController(emit) {
    this.emit = emit
    this.gameObjects = []
}

GameObjectController.prototype.start = function (users, { emit, mapController, botCount }) {

    this.gameObjects = []
    for (let i = 0; i < users.length; i++) {
        users[i].player = this.createPlayer({ emit, mapController })
        users[i].player.color = users[i].color
        users[i].player.spells = users[i].spells
        users[i].player.user = users[i]
    }

    for (let i = 0; i < botCount; i++) {
        let player = this.createPlayer({ isBot: true, emit, mapController })
        player.color = BOT_COLORS[_.random(0, BOT_COLORS.length - 1)]
    }
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
        players: this.gameObjects.filter(x => x.type === goTypes.PLAYER).map(x => x.info()),
        spells: this.gameObjects.filter(x => x.type === goTypes.SPELL).map(x => x.info()),
    }

}

GameObjectController.prototype.update = function (deltatime) {

    this.gameObjects.forEach(u => u.update(deltatime))

}

GameObjectController.prototype.createPlayer = function (opt) {
    const id = uuid.v4()
    const player = new Player(id, opt, this)
    this.gameObjects.push( player )

    return player
}

GameObjectController.prototype.createFireball = function (data) {
    const id = uuid.v4()
    const fireball = new Fireball(id, data, this)

    this.gameObjects.push( fireball )

    return fireball
}

GameObjectController.prototype.createFollower = function (data) {
    const id = uuid.v4()
    const follower = new Follower(id, data, this)

    this.gameObjects.push( follower )

    return follower
}

GameObjectController.prototype.createBoomerang = function (data) {
    const id = uuid.v4()
    const boomerang = new Boomerang(id, data, this)

    this.gameObjects.push( boomerang )

    return boomerang
}

GameObjectController.prototype.createObstacle = function (position) {
    const id = uuid.v4()
    const obs = new Obstacle(id, position, this)
    this.gameObjects.push(obs)

    return obs
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

    if(goDeleted) this.emit('gameobject_delete', goDeleted.info())
}

GameObjectController.prototype.destroyPlayer = function (id) {
    this.gameObjects = this.gameObjects.filter(x => x.id !== id)
}

module.exports = GameObjectController
