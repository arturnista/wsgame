const _ = require('lodash')
const goTypes = require('./gameObjectTypes')
const vector = require('../utils/vector')
const colliders = require('./Physics/colliders')

function Player(id, goController) {
    this.id = id
    this.type = goTypes.PLAYER

    this.collider = colliders.createCircle(10)
    this.goController = goController

    this.status = 'alive'
    this.start()
}

Player.prototype.start = function () {
    this.position = { x: 100, y: 100 }
    this.velocity = { x: 0, y: 0 }
    this.desiredVelocity = { x: 0, y: 0 }
    this.life = 100
    this.knockbackValue = 100

    this.moveSpeed = 200
    this.acceleration = 100
    this.positionToGo = null
}

Player.prototype.restart = function () {
    this.start()

    this.status = 'alive'
}

Player.prototype.info = function () {
    return {
        id: this.id,
        life: this.life,
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        knockbackValue: this.knockbackValue
    }
}

Player.prototype.setPositionToGo = function (position) {
    this.positionToGo = position
}

Player.prototype.dealDamage = function (damage) {
    this.life -= damage
    if(this.life <= 0) {
        this.status = 'dead'
    }
}

Player.prototype.knockback = function (direction, multiplier, adder) {
    const knockbackValue = this.knockbackValue * multiplier

    this.velocity = vector.multiply(direction, knockbackValue)

    this.knockbackValue *= adder
}

Player.prototype.update = function (deltatime) {
    if(this.status === 'dead') return

    if(this.positionToGo == null) return

    const distance = vector.distance(this.position, this.positionToGo)
    if(distance <= 2) {

        this.desiredVelocity = { x: 0, y: 0 }
        this.velocity = { x: 0, y: 0 }
        this.positionToGo = null

    } else {

        let deltaX = Math.abs(this.positionToGo.x - this.position.x) / Math.abs(this.positionToGo.y - this.position.y)
        let deltaY = 1
        let deltaSum = deltaX + deltaY

        deltaX = deltaX / deltaSum
        deltaY = deltaY / deltaSum

        if(this.positionToGo.x < this.position.x) deltaX *= -1
        if(this.positionToGo.y < this.position.y) deltaY *= -1

        this.desiredVelocity = {
            x: this.moveSpeed * deltaX,
            y: this.moveSpeed * deltaY,
        }

        if(this.desiredVelocity.x > this.velocity.x) this.velocity.x += this.acceleration * deltatime
        else if(this.desiredVelocity.x < this.velocity.x) this.velocity.x -= this.acceleration * deltatime
        if(this.desiredVelocity.y > this.velocity.y) this.velocity.y += this.acceleration * deltatime
        else if(this.desiredVelocity.y < this.velocity.y) this.velocity.y -= this.acceleration * deltatime

    }
}

module.exports = Player
