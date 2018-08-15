const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const gameObjectController = require('./GameObjectController')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

function Bubble(data, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.SPELL)

    this.direction = data.direction
    this.goController = goController
    this.owner = this.goController.gameObjects.find(x => x.id === data.id)
    this.caster = this.goController.gameObjects.find(x => x.id === data.caster)

    this.collider = colliders.createCircle(80)

    this.position = { x: 0, y: 0 }
    if(this.owner) {
        this.position = vector.add( this.caster.position, vector.multiply(data.direction, this.owner.collider.size) )
    }

    this.multiplier = data.knockbackMultiplier
    this.increment = data.knockbackIncrement
    this.moveSpeed = data.moveSpeed

    this.distance = data.distance
    this.originalPosition = _.clone(this.position)

    this.players = []
    this.playersToIgnore = []

    this.velocity = {
        x: this.direction.x * this.moveSpeed,
        y: this.direction.y * this.moveSpeed,
    }
}

Bubble.prototype.info = function () {
    return {
        id: this.id,
        type: 'bubble',
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        owner: this.owner ? this.owner.id : ''
    }
}

Bubble.prototype.update = function (deltatime) {
    const { gameObjects } = this.goController

    if(vector.distance(this.position, this.originalPosition) >= this.distance) {
        this.goController.destroy(this.id)
    }

    for (let index = 0; index < this.players.length; index++) {
        if(!this.players[index]) continue
        if(vector.distance(this.players[index].position, this.position) >= 80) {
            this.players[index] = null
            continue
        }
        if(this.players[index].modifiers.find(x => x.effects.reflectSpells)) {
            this.players[index] = null
            continue
        }
        
        this.players[index].position.x = this.position.x
        this.players[index].position.y = this.position.y
    }
}

Bubble.prototype.reflect = function(object, direction) {
    if(vector.isZero(direction)) direction = { x: 1, y: 1 }
    this.velocity = vector.multiply(direction, this.moveSpeed)

    this.playersToIgnore.push(object.id)
    this.players = this.players.filter(x => x && x.id !== object.id)

    this.owner = null
}

Bubble.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return
    if(this.owner && object.id === this.owner.id) return

    if(goTypes.isType(object.type, goTypes.PLAYER)) {
        if(object.status !== 'alive') return
        if(this.owner && object.id === this.owner.id) return

        const shouldReflect = object.modifiers.find(x => x.effects.reflectSpells) != null
        if(shouldReflect) {
            this.reflect(object, direction)
            return
        }

        if(this.playersToIgnore.indexOf(object.id) !== -1) return

        this.playersToIgnore.push(object.id)
        this.players.push(object)
        
    } else if(goTypes.isType(object.type, goTypes.OBSTACLE)) {
        this.goController.destroy(this.id)
    }
    
}

module.exports = Bubble
