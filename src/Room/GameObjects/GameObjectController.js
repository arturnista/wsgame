const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')

const Fireball = require('./Fireball')
const Player = require('./Player')
const Obstacle = require('./Obstacle')

function GameObjectController(emit) {
    this.emit = emit
    this.gameObjects = []
}

GameObjectController.prototype.start = function (users) {

    this.gameObjects = []
    for (var i = 0; i < users.length; i++) {
        users[i].player = this.createPlayer()
    }

}

GameObjectController.prototype.end = function (users) {
    this.gameObjects = []
    for (var i = 0; i < users.length; i++) {
        users[i].player = {}
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

GameObjectController.prototype.createPlayer = function () {
    const id = uuid.v4()
    const player = new Player(id, this)
    this.gameObjects.push( player )

    return player
}

GameObjectController.prototype.createFireball = function (data) {
    const id = uuid.v4()
    const fireball = new Fireball(id, data, this)
    this.gameObjects.push( fireball )

    return fireball
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
    this.gameObjects = this.gameObjects.filter(x => x.id !== id && (x.owner == null || x.owner.id !== id))
}

module.exports = GameObjectController