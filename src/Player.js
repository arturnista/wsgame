const _ = require('lodash')
const goTypes = require('./gameObjectTypes')

function Player(id) {
    this.id = id
    this.type = goTypes.PLAYER
    this.position = {
        x: 0.0,
        y: 0.0
    }

    this.life = 100

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
}

Player.prototype.dealDamage = function (damage) {
    this.life -= damage
    if(this.life <= 0) {
        console.log(`${this.id} IS DED`)
    }
}

Player.prototype.update = function (deltatime) {
    if(this.positionToGo == null) return

    let deltaX = Math.abs(this.position.x - this.positionToGo.x) / Math.abs(this.position.y - this.positionToGo.y)
    let deltaY = 1 / deltaX
    let deltaSum = deltaX + deltaY

    deltaX = deltaX / deltaSum
    deltaY = deltaY / deltaSum

    const currentMoveSpeedX = this.moveSpeed * deltatime * deltaX
    const currentMoveSpeedY = this.moveSpeed * deltatime * deltaY

    if(this.positionToGo.x > this.position.x) {

        this.position.x += currentMoveSpeedX
        if(this.position.x > this.positionToGo.x) {
            this.position.x = this.positionToGo.x
        }

    } else if(this.positionToGo.x < this.position.x) {

        this.position.x -= currentMoveSpeedX
        if(this.position.x < this.positionToGo.x) {
            this.position.x = this.positionToGo.x
        }

    }

    if(this.positionToGo.y > this.position.y) {

        this.position.y += currentMoveSpeedY
        if(this.position.y > this.positionToGo.y) {
            this.position.y = this.positionToGo.y
        }

    } else if(this.positionToGo.y < this.position.y) {

        this.position.y -= currentMoveSpeedY
        if(this.position.y < this.positionToGo.y) {
            this.position.y = this.positionToGo.y
        }

    }

    if(_.isEqual(this.position, this.positionToGo)) this.positionToGo = null
}

module.exports = Player
