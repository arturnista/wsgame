const _ = require('lodash')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('./utils/vector')
const colliders = require('./Physics/colliders')

function Obstacle(id, {position, size}, goController) {
    this.id = id
    this.type = goTypes.OBSTACLE

    this.goController = goController
    this.collider = colliders.createCircle(size)

    this.position = {
        x: position.x,
        y: position.y,
    }

}

Obstacle.prototype.info = function () {
    return {
        id: this.id,
        position: this.position,
        collider: this.collider
    }
}

Obstacle.prototype.update = function (deltatime) {

}

module.exports = Obstacle
