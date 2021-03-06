const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const AutoDestroyBehaviour = require('./Behaviours/AutoDestroyBehaviour')

function Follower(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.SPELL)

    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)
    this.caster = this.goController.gameObjects.find(x => x.id === data.caster)

    this.position = { x: 0, y: 0 }
    if(this.owner && this.caster) {
        this.position = vector.add( this.caster.position, vector.multiply(data.direction, this.owner.collider.size) )
    }

    this.target = this.goController.gameObjects.reduce((minor, item) => {
        if(item.id === this.owner.id) return minor
        if(!goTypes.isType(item.type, goTypes.PLAYER)) return minor
        if(item.status !== 'alive') return minor
        if(!minor) return item

        if(vector.distance(this.position, minor.position) < vector.distance(this.position, item.position)) {
            return item
        }
        return minor
    }, null)

    this.collider = colliders.createCircle(20)

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement
    this.moveSpeed = data.moveSpeed

    this.duration = data.duration / 1000
    this.behaviours = [
        new AutoDestroyBehaviour(this, this.goController, this.duration)
    ]

    this.direction = { x: 0, y: 0 }
    if(this.target != null) this.direction = vector.direction(this.position, this.target.position)
    
    this.acceleration = 30
    this.desiredVelocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }
    this.velocity = {
        x: 0,
        y: 0
    }
}

Follower.prototype.info = function () {
    return {
        id: this.id,
        type: 'follower',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

Follower.prototype.update = function (deltatime) {
    if(!this.target || !this.target.exists || !this.caster) {
        this.goController.destroy(this)
        return
    }

    if(this.behaviours.length > 0) this.behaviours.forEach(behaviour => behaviour.update(deltatime))

    const { gameObjects } = this.goController

    this.direction = vector.direction(this.position, this.target.position)
    this.desiredVelocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }

    this.acceleration += 20 * deltatime
    if(this.velocity.x < this.desiredVelocity.x) this.velocity.x += this.acceleration * deltatime
    else if(this.velocity.x > this.desiredVelocity.x) this.velocity.x -= this.acceleration * deltatime
    if(this.velocity.y < this.desiredVelocity.y) this.velocity.y += this.acceleration * deltatime
    else if(this.velocity.y > this.desiredVelocity.y) this.velocity.y -= this.acceleration * deltatime
}

Follower.prototype.reflect = function(object, direction) {
    const newOwner = _.cloneDeep(object)
    this.target = this.owner
    this.owner = newOwner

    this.lifeTime = this.duration
    this.velocity = {
        x: 0,
        y: 0
    }
}

Follower.prototype.onCollide = function (object, direction, directionInv) {
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

module.exports = Follower
