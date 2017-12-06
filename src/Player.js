const _ = require('lodash')
const goTypes = require('./gameObjectTypes')
const vector = require('./utils/vector')

function Player(id, goController) {
    this.id = id
    this.type = goTypes.PLAYER
    this.position = { x: 0, y: 0 }
    this.velocity = { x: 0, y: 0 }

    this.life = 100
    this.goController = goController

    this.moveSpeed = 100
    this.positionToGo = null
}

Player.prototype.info = function () {
    return {
        id: this.id,
        position: this.position
    }
}

Player.prototype.setPositionToGo = function (position) {
    this.positionToGo = position

    let deltaX = Math.abs(this.positionToGo.x - this.position.x) / Math.abs(this.positionToGo.y - this.position.y)
    let deltaY = 1 / deltaX
    let deltaSum = deltaX + deltaY
    console.log(deltaX, deltaY)

    deltaX = deltaX / deltaSum
    deltaY = deltaY / deltaSum

    if(this.positionToGo.x < this.position.x) deltaX *= -1
    if(this.positionToGo.y < this.position.y) deltaY *= -1

    console.log(deltaX, deltaY)

    this.velocity = {
        x: this.moveSpeed * deltaX,
        y: this.moveSpeed * deltaY,
    }

}

Player.prototype.dealDamage = function (damage) {
    this.life -= damage
    if(this.life <= 0) {
        this.goController.destroy(this.id)
    }
}

Player.prototype.update = function (deltatime) {
    if(this.positionToGo == null) return

    const distance = vector.distance(this.position, this.positionToGo)
    // console.log(distance)
    if(distance < 3) {
        this.velocity = { x: 0, y: 0 }
        this.positionToGo = null
    }
}

module.exports = Player
