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

    this.moveSpeed = 200
    this.velocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }
}

Fireball.prototype.info = function () {
    return {
        id: this.id,
        type: 'fireball',
        position: this.position
    }
}

Fireball.prototype.update = function (deltatime) {
    const { gameObjects } = this.goController

    for (var i = 0; i < gameObjects.length; i++) {
        if(gameObjects[i].id === this.id) continue
        if(gameObjects[i].id === this.owner.id) continue

        const distance = vector.distance(gameObjects[i].position, this.position)
        if(distance < 1) {
            if(gameObjects[i].type === goTypes.PLAYER) {
                gameObjects[i].dealDamage(10)
            }

            this.goController.destroy(this.id)
        }
    }
}

Fireball.prototype.onCollide = function (object) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(object.id === this.owner.id) return

    if(object.type === goTypes.PLAYER) {
        object.dealDamage(10)
    }

    this.goController.destroy(this.id)
}

module.exports = Fireball
