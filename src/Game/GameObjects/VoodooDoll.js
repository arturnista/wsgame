const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const AutoDestroyBehaviour = require('./Behaviours/AutoDestroyBehaviour')

function VoodooDoll(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.SPELL)

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)
    this.caster = this.goController.gameObjects.find(x => x.id === data.caster)

    this.collider = colliders.createCircle(32)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = _.clone(this.caster.position)
    }

    this.behaviours = [
        new AutoDestroyBehaviour(this, this.goController, data.duration / 1000)
    ]

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
    if(this.behaviours.length > 0) this.behaviours.forEach(behaviour => behaviour.update(deltatime))
}

VoodooDoll.prototype.reflect = function(object, direction) {
    
}

module.exports = VoodooDoll
