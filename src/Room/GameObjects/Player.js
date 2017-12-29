const _ = require('lodash')
const moment = require('moment')
const goTypes = require('./gameObjectTypes')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const spells = require('./spells')

function Player(id, goController) {
    this.id = id
    this.type = goTypes.PLAYER

    this.collider = colliders.createCircle(25)
    this.goController = goController

    this.status = 'alive'
    this.color = ''
    this.start()
}

Player.prototype.start = function () {
    this.moveSpeed = 200
    this.positionToGo = null

    this.position = { x: 0, y: 0 }

    this.velocity = { x: 0, y: 0 }
    this.knockbackVelocity = { x: 0, y: 0 }
    this.moveVelocity = { x: 0, y: 0 }

    this.life = 100
    this.knockbackValue = 300

    this.spellsUsed = {}
    this.modifiers = []
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
        status: this.status,
        knockbackValue: this.knockbackValue,
        color: this.color,
        modifiers: this.modifiers.map(x => x.name)
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
    let knockbackValue = this.knockbackValue * multiplier
    knockbackValue = this.modifiers.reduce((v, m) => _.isNil(m.effects.knockback) ? v : v * m.effects.knockback, knockbackValue)

    let knockbackAdder = adder
    knockbackAdder = this.modifiers.reduce((v, m) => _.isNil(m.effects.knockbackAdder) ? v : v * m.effects.knockbackAdder, knockbackAdder)

    if(knockbackValue) this.knockbackVelocity = vector.add(this.knockbackVelocity, vector.multiply(direction, knockbackValue))
    if(knockbackAdder) this.knockbackValue *= knockbackAdder
}

Player.prototype.useSpell = function(spellName, data) {
    if(this.status !== 'alive') return
    if(!spells[spellName]) return

    const spellData = spells[spellName]
    if(this.spellsUsed[spellName] && moment().diff(this.spellsUsed[spellName]) < spellData.cooldown) return
    this.spellsUsed[spellName] = moment()

    switch (spellName) {
        case 'fireball':
            this.goController.createFireball(data)
            break
        case 'reflect_shield':
            this.modifiers.push(Object.assign({ name: spellName, initial: moment() }, spellData))
            break
    }
}

Player.prototype.update = function (deltatime) {
    if(this.status === 'dead') {
        this.velocity = { x: 0, y: 0 }
        return
    }

    this.modifiers = this.modifiers.filter(m => moment().diff(m.initial) < m.duration)

    if(this.positionToGo != null) {

        const distance = vector.distance(this.position, this.positionToGo)
        if(distance <= 2) {

            this.moveVelocity = { x: 0, y: 0 }
            this.positionToGo = null

        } else {

            let deltaX = Math.abs(this.positionToGo.x - this.position.x) / Math.abs(this.positionToGo.y - this.position.y)
            let deltaY = 1
            let deltaSum = deltaX + deltaY

            deltaX = deltaX / deltaSum
            deltaY = deltaY / deltaSum

            if(this.positionToGo.x < this.position.x) deltaX *= -1
            if(this.positionToGo.y < this.position.y) deltaY *= -1

            this.moveVelocity = {
                x: this.moveSpeed * deltaX,
                y: this.moveSpeed * deltaY,
            }

        }

    }
    if(vector.length(this.knockbackVelocity) > 0) {
        this.knockbackVelocity = vector.reduceToZero(this.knockbackVelocity, 300 * deltatime)
    }
    this.velocity = vector.add(this.moveVelocity, this.knockbackVelocity)

}

Player.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return

    if(object.type === goTypes.OBSTACLE) {
        this.knockbackVelocity = vector.multiply(direction, vector.length(this.knockbackVelocity))
    }
    
}

module.exports = Player
