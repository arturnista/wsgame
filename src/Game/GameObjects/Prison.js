const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const AutoDestroyBehaviour = require('./Behaviours/AutoDestroyBehaviour')

function Prison(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.PLAYER_OBSTACLE, goTypes.SPELL)

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)
    this.caster = this.goController.gameObjects.find(x => x.id === data.caster)

    let radius = data.radius
    if(!_.isNil(data.size)) {
        radius = _.clamp(data.size, data.minRadius, data.maxRadius)
        data.duration = (data.minRadius / radius) * data.baseDuration
    }
    
    this.collider = colliders.createCircle(radius * 2, 15)

    this.velocity = { x: 0, y: 0 }
    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = data.position
    }

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement
    
    this.behaviours = [
        new AutoDestroyBehaviour(this, this.goController, data.duration / 1000)
    ]

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
    if(this.behaviours.length > 0) this.behaviours.forEach(behaviour => behaviour.update(deltatime))
}

Prison.prototype.reflect = function () {

}

module.exports = Prison
