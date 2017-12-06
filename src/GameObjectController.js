const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')

const Fireball = require('./Fireball')
const Player = require('./Player')

function GameObjectController() {
    this.gameObjects = []
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
    this.gameObjects.push( new Player(id, this) )

    return id
}

GameObjectController.prototype.createFireball = function (data) {
    const id = uuid.v4()
    this.gameObjects.push( new Fireball(id, data, this) )

    return id
}

GameObjectController.prototype.destroy = function (gameObject) {
    if(typeof gameObject === 'string') {
        gameObject = { id: gameObject }
    }

    this.gameObjects = this.gameObjects.filter(x => x.id !== gameObject.id)
}

GameObjectController.prototype.destroyPlayer = function (id) {
    this.gameObjects = this.gameObjects.filter(x => x.id !== id && (x.owner == null || x.owner.id !== id))
}

module.exports = GameObjectController
