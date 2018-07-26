const _ = require('lodash')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function Follower(id, data, goController) {
    this.id = id
    this.type = goTypes.SPELL

    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = vector.add( this.owner.position, vector.multiply(data.direction, this.owner.collider.size) )
    }

    this.target = this.goController.gameObjects.reduce((minor, item) => {
        if(item.id === this.owner.id) return minor
        if(item.type !== goTypes.PLAYER) return minor
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

    this.lifeTime = 8
    this._timePassed = 0

    if(this.target == null) return
    this.direction = vector.direction(this.position, this.target.position)
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
        velocity: this.velocity
    }
}

Follower.prototype.update = function (deltatime) {
    if(this.target == null) {
        this.goController.destroy(this)
        return
    }
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

    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.id)
    }
}

Follower.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(this.owner && object.id === this.owner.id) return
    
    if(object.type === goTypes.PLAYER) {
        if(object.status !== 'alive') return
        
        object.knockback(directionInv, this.multiplier, this.increment)
        const shouldReflect = object.modifiers.find(x => x.effects.reflectSpells) != null
        if(shouldReflect) {
            const newTarget = _.cloneDeep(this.owner)
            const newOwner = _.cloneDeep(object)
            this.owner = newOwner
            this.target = newTarget

            this.velocity = {
                x: 0,
                y: 0
            }
            return
        }
        this.goController.destroy(this.id)
    } else if(object.type === goTypes.OBSTACLE) {
        this.goController.destroy(this.id)
    }

}

module.exports = Follower
