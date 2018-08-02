const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function VoodooDoll(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.SPELL

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.owner)

    this.collider = colliders.createCircle(32)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = _.clone(this.owner.position)
    }

    this.lifeTime = data.duration / 1000
    this._timePassed = 0

    this.velocity = { x: 0, y: 0 }
}

VoodooDoll.prototype.info = function () {
    return {
        id: this.id,
        type: 'voodoo_doll',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

VoodooDoll.prototype.update = function (deltatime) {
    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.id)
    }
}

VoodooDoll.prototype.reflect = function(object, direction) {
    
}

module.exports = VoodooDoll
