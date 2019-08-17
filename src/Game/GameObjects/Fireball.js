const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const AutoDestroyBehaviour = require('./Behaviours/AutoDestroyBehaviour')

function Fireball(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.SPELL)

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)
    this.caster = this.goController.gameObjects.find(x => x.id === data.caster)

    this.collider = colliders.createCircle(40)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = vector.add( this.caster.position, vector.multiply(data.direction, this.owner.collider.size) )
    }

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement
    this.moveSpeed = data.moveSpeed

    this.behaviours = [
        new AutoDestroyBehaviour(this, this.goController, 5)
    ]

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
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

Fireball.prototype.update = function (deltatime) {
    if(this.behaviours.length > 0) this.behaviours.forEach(behaviour => behaviour.update(deltatime))
}

Fireball.prototype.reflect = function(object, direction) {
    this.velocity = vector.multiply(direction, this.moveSpeed)
    this.owner = null
}

Fireball.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(this.owner && object.id === this.owner.id) return

    if(goTypes.isType(object.type, goTypes.PLAYER)) {
        if(object.status !== 'alive') return

        const shouldReflect = object.modifiers.find(x => x.effects.reflectSpells) != null
        if(shouldReflect) {
            this.reflect(object, direction)
            return
        }
        object.knockback(directionInv, this.multiplier, this.increment)
        this.goController.destroy(this.id, 'hit_player')
    } else if(goTypes.isType(object.type, goTypes.OBSTACLE)) {
        this.goController.destroy(this.id, 'hit_obstacle')
    }
    
}

module.exports = Fireball
