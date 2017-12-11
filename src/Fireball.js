const _ = require('lodash')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('./utils/vector')
const colliders = require('./Physics/colliders')

function Fireball(id, data, goController) {
    this.id = id
    this.type = goTypes.SPELL

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)

    this.collider = colliders.createCircle(10)

    this.position = {
        x: this.owner.position.x,
        y: this.owner.position.y,
    }

    this.multiplier = 1
    this.percentageAdder = 1.2
    this.moveSpeed = 100

    this.lifeTime = 10
    this._timePassed = 0

    this.velocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }
}

Fireball.prototype.info = function () {
    return {
        id: this.id,
        type: 'fireball',
        position: this.position,
        collider: this.collider
    }
}

Fireball.prototype.update = function (deltatime) {
    const { gameObjects } = this.goController

    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.id)
    }
}

Fireball.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(object.id === this.owner.id) return

    if(object.type === goTypes.PLAYER) {
        object.knockback(directionInv, this.multiplier, this.percentageAdder)
    }

    this.goController.destroy(this.id)
}

module.exports = Fireball
