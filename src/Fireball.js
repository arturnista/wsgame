const _ = require('lodash')
const goTypes = require('./gameObjectTypes')

function Fireball(id, data, gameObjects) {
    this.id = id
    this.type = goTypes.SPELL

    this.direction = data.direction

    this.owner = gameObjects.find(x => x.id === data.id)
    this.gameObjects = gameObjects

    this.position = {
        x: this.owner.position.x,
        y: this.owner.position.y,
    }
    this.moveSpeed = 200
}

Fireball.prototype.info = function () {
    return {
        id: this.id,
        type: 'fireball',
        position: this.position
    }
}

Fireball.prototype.update = function (deltatime) {
    this.position.x += this.direction.x * deltatime * this.moveSpeed
    this.position.y += this.direction.y * deltatime * this.moveSpeed

    for (var i = 0; i < this.gameObjects.length; i++) {
        if(this.gameObjects[i].type !== goTypes.PLAYER) continue
        if(this.gameObjects[i].id === this.id) continue
        if(this.gameObjects[i].id === this.owner.id) continue

        const deltaX = Math.abs(this.gameObjects[i].position.x - this.position.x)
        const deltaY = Math.abs(this.gameObjects[i].position.y - this.position.y)

        const distance = Math.sqrt(deltaX + deltaY)

        if(distance < 1) {
            this.gameObjects[i].dealDamage(10)
        }
    }
}

module.exports = Fireball
