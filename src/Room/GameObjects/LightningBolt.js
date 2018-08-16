const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function LightningBolt(data, goController) {
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

    this.effectDuration = data.duration
    this.radius = data.radius
    this.hitEffects = data.hitEffects

    this.lifeTime = 5
    this._timePassed = 0

    this.velocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }
}

LightningBolt.prototype.info = function () {
    return {
        id: this.id,
        type: 'lightning_bolt',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

LightningBolt.prototype.update = function (deltatime) {
    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.id)
    }
}

LightningBolt.prototype.reflect = function(object, direction) {
    this.velocity = vector.multiply(direction, this.moveSpeed)
    this.owner = null
}

LightningBolt.prototype.explode = function(mult, object) {
    const { gameObjects } = this.goController
    gameObjects.forEach(hitObject => {
        if((this.owner && hitObject.id === this.owner.id) || (object && hitObject.id === object.id) || !goTypes.isType(hitObject.type, goTypes.PLAYER) || hitObject.status !== 'alive' || vector.distance(hitObject.position, this.position) > (this.radius + hitObject.collider.radius)) return

        const dir = vector.direction(this.position, hitObject.position)
        hitObject.knockback(
            dir.x === 0 && dir.y === 0 ? { x: 1, y: 1 } : dir,
            this.multiplier * mult, this.increment
        )
    })
}

LightningBolt.prototype.onCollide = function (object, direction, directionInv) {

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
        object.addModifier('stun', { effects: this.hitEffects, duration: this.effectDuration } )
        this.explode(1, object)
        this.goController.destroy(this.id)
    } else if(goTypes.isType(object.type, goTypes.OBSTACLE)) {
        this.explode(.5)
        this.goController.destroy(this.id)
    }
    
}

module.exports = LightningBolt
