const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function ShotgunProjectile(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.SPELL)

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)
    this.caster = this.goController.gameObjects.find(x => x.id === data.caster)

    this.collider = colliders.createCircle(30)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = vector.add( this.caster.position, vector.multiply(data.direction, this.owner.collider.size) )
    }

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement
    this.moveSpeed = data.moveSpeed

    this.lifeTime = 5
    this._timePassed = 0

    const angle = Math.atan2(this.direction.y, this.direction.x)
    const xProj = Math.cos(angle + (data.index * 20 * 0.017453286))
    const yProj = Math.sin(angle + (data.index * 20 * 0.017453286))

    this.velocity = {
        x: xProj * this.moveSpeed,
        y: yProj * this.moveSpeed,
    }
}

ShotgunProjectile.prototype.info = function () {
    return {
        id: this.id,
        type: 'shotgun',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

ShotgunProjectile.prototype.update = function (deltatime) {
    const { gameObjects } = this.goController

    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.id)
    }
}

ShotgunProjectile.prototype.reflect = function(object, direction) {
    this.velocity = vector.multiply(direction, this.moveSpeed)
    this.owner = null
}

ShotgunProjectile.prototype.onCollide = function (object, direction, directionInv) {
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
        this.goController.destroy(this.id)
    } else if(goTypes.isType(object.type, goTypes.OBSTACLE)) {
        this.goController.destroy(this.id)
    }
    
}

module.exports = ShotgunProjectile
