const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function Obstacle({position, size}, goController) {
    this.id = uuid.v4()
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
        type: 'map_obstacle',
        position: this.position,
        collider: this.collider
    }
}

Obstacle.prototype.update = function (deltatime) {

}

module.exports = Obstacle
