const _ = require('lodash')
const goTypes = require('./gameObjectTypes')
const vector = require('./utils/vector')
const colliders = require('./Physics/colliders')

function Player(id, goController) {
    this.id = id
    this.type = goTypes.PLAYER
    this.position = { x: 150, y: 150 }
    this.velocity = { x: 0, y: 0 }
    this.desiredVelocity = { x: 0, y: 0 }

    this.collider = colliders.createCircle(10)

    this.life = 100
    this.knockbackPercentage = .5
    this.goController = goController

    this.moveSpeed = 100
    this.acceleration = 50
    this.positionToGo = null
}

Player.prototype.info = function () {
    return {
        id: this.id,
        life: this.life,
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        percentage: this.knockbackPercentage
    }
}

Player.prototype.setPositionToGo = function (position) {
    this.positionToGo = position
}

Player.prototype.dealDamage = function (damage) {
    this.life -= damage
    if(this.life <= 0) {
        this.goController.destroy(this.id)
    }
}

Player.prototype.knockback = function (direction, multiplier, adder) {
    const knockbackValue = this.knockbackPercentage * multiplier * 10

    this.velocity = vector.multiply(direction, knockbackValue)

    this.knockbackPercentage *= 1 + adder
}

Player.prototype.update = function (deltatime) {
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
