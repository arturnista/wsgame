const _ = require('lodash')

function User(id) {
    this.id = id
    this.position = {
        x: 0.0,
        y: 0.0
    }
    this.moveSpeed = 20
    this.positionToGo = null
}

User.prototype.info = function () {
    return {
        id: this.id,
        position: this.position
    }
}

User.prototype.setPositionToGo = function (position) {
    this.positionToGo = position
}

User.prototype.move = function (deltatime) {
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

module.exports = User
