const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('../gameObjectTypes')
const vector = require('../utils/vector')

function Physics(goController) {
    this.goController = goController
}

Physics.prototype.update = function (deltatime) {

    for (var i = 0; i < this.goController.gameObjects.length; i++) {
        const object = this.goController.gameObjects[i]

        if(vector.length(object.velocity) > 0) {
            object.position.x += object.velocity.x * deltatime
            object.position.y += object.velocity.y * deltatime
        }
    }

    for (var i = 0; i < this.goController.gameObjects.length - 1; i++) {
        const object = this.goController.gameObjects[i]
        if(!object.collider || !object.onCollide) continue

        for (var n = i + 1; n < this.goController.gameObjects.length; n++) {
            const objectCmp = this.goController.gameObjects[n]
            if(!objectCmp.collider) continue

            const centerDiff = Math.pow((object.position.x - objectCmp.position.x), 2) + Math.pow((object.position.y - objectCmp.position.y), 2)
            const radiusDiff = Math.pow((object.collider.radius + objectCmp.collider.radius), 2)

            if(radiusDiff >= centerDiff) {
                setImmediate(object.onCollide.bind(object), objectCmp)
            }
        }
    }

}

module.exports = Physics
