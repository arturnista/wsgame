const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function Boomerang(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.SPELL

    this.direction = data.direction
    this.distance = data.distance
    this.goController = goController
    this.isFollowingPlayer = false
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)

    this.collider = colliders.createCircle(30)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = vector.add( this.owner.position, vector.multiply(data.direction, this.owner.collider.size) )
    }
    this.originalPosition = { x: this.position.x, y: this.position.y }

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement
    this.moveSpeed = data.moveSpeed

    this.velocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }
}

Boomerang.prototype.info = function () {
    return {
        id: this.id,
        type: 'boomerang',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

Boomerang.prototype.update = function (deltatime) {
    const { gameObjects } = this.goController

    if(!this.isFollowingPlayer) {
        if(vector.distance(this.position, this.originalPosition) > this.distance) {
            this.velocity = vector.multiply(this.velocity, -1)
            this.isFollowingPlayer = true
        }
    } else {
        const playerDir = vector.direction(this.position, this.owner.position)
        this.velocity = vector.multiply(playerDir, this.moveSpeed)
    }
}

Boomerang.prototype.reflect = function(object, direction) {
    
}

Boomerang.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(this.owner && object.id === this.owner.id) {
        if(this.isFollowingPlayer) {
            this.owner.resetCooldown('boomerang')
            this.goController.destroy(this.id)
        }
        return
    }

    if(object.type === goTypes.PLAYER) {
        if(object.status !== 'alive') return

        const shouldReflect = object.modifiers.find(x => x.effects.reflectSpells) != null
        if(!shouldReflect) {
            this.owner.resetCooldown('boomerang')
            object.knockback(directionInv, this.multiplier, this.increment)
        }
        
        this.goController.destroy(this.id)
    } else if(object.type === goTypes.OBSTACLE) {
        this.goController.destroy(this.id)
    }
    
}

module.exports = Boomerang
