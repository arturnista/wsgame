const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('../GameObjects/gameObjectTypes')
const vector = require('../../utils/vector')

function Physics(goController) {
    this.goController = goController
}

Physics.prototype.update = function (deltatime) {
    const onCollideFunctions = []

    for (var i = 0; i < this.goController.gameObjects.length; i++) {
        const object = this.goController.gameObjects[i]
        if (!object.collider) continue

        let directionToMove = object.velocity
        if (!directionToMove || vector.length(directionToMove) === 0) continue

        let nextPosition = {
            x: object.position.x + directionToMove.x * deltatime,
            y: object.position.y + directionToMove.y * deltatime,
        }
        let nextObj = Object.assign({}, object, { position: nextPosition })

        for (var n = 0; n < this.goController.gameObjects.length; n++) {
            if (!directionToMove || vector.length(directionToMove) === 0) break
            if (i === n) continue

            const objectCmp = this.goController.gameObjects[n]
            if (!objectCmp.collider) continue

            let collided = false

            collided = this.circleCollision( nextObj, objectCmp )

            if (collided) {
                const dirCollision = vector.direction(objectCmp.position, object.position)
                const dirCollisionInv = vector.direction(object.position, objectCmp.position)
                if (object.onCollide) onCollideFunctions.push(_ => object.onCollide(objectCmp, dirCollision, dirCollisionInv))

                const multiplier = .7

                if (objectCmp.type === goTypes.OBSTACLE) {
                    directionToMove = vector.multiply(dirCollision, vector.length(directionToMove) * multiplier)
                } else if (object.type === goTypes.OBSTACLE) {
                    directionToMove = vector.multiply(dirCollision, vector.length(directionToMove) * multiplier)
                }
            }
        }

        if (directionToMove && vector.length(directionToMove) > 0) {
            object.position.x += directionToMove.x * deltatime
            object.position.y += directionToMove.y * deltatime
        }
    }

    for (let i = 0; i < onCollideFunctions.length; i++) {
        const fun = onCollideFunctions[i]
        fun()
    }

}

Physics.prototype.circleCollision = function (obj1, obj2) {
    const centerDiff = Math.pow((obj1.position.x - obj2.position.x), 2) + Math.pow((obj1.position.y - obj2.position.y), 2)
    const radiusDiff = Math.pow((obj1.collider.radius + obj2.collider.radius), 2)

    return radiusDiff >= centerDiff
}

Physics.prototype.boxCollision = function (obj1, obj2) {
    const obj1Edges = obj1.collider.edges(obj1.position)
    const obj2Edges = obj2.collider.edges(obj2.position)

    if (obj1Edges.max.x <= obj2Edges.min.x) return false // a is left of b
    if (obj1Edges.min.x >= obj2Edges.max.x) return false // a is right of b
    if (obj1Edges.max.y <= obj2Edges.min.y) return false // a is above b
    if (obj1Edges.min.y >= obj2Edges.max.y) return false // a is below b

    return true // boxes overlap
}

module.exports = Physics
