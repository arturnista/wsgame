const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function Prison(data, goController) {
    this.id = uuid.v4()
    this.type = [goTypes.OBSTACLE]

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.owner)

    this.collider = colliders.createCircle(data.radius)

    this.velocity = { x: 0, y: 0 }
    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = data.position
    }

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement

    this.lifeTime = data.duration / 1000
    this._timePassed = 0

}

Prison.prototype.info = function () {
    return {
        id: this.id,
        type: 'prison',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

Prison.prototype.update = function (deltatime) {
    const { gameObjects } = this.goController

    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.id)
    }
}

Prison.prototype.reflect = function(object, direction) {

}

Prison.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(this.owner && object.id === this.owner.id) return

    if(goTypes.isType(object.type, goTypes.PLAYER)) {

    } else {
        if(object.reflect) object.reflect(object, direction)
    }
    
}

module.exports = Prison
