const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('../GameObjects/gameObjectTypes')
const vector = require('../../utils/vector')

function Physics(goController) {
    this.goController = goController
}

Physics.prototype.update = function (deltatime) {
    const movementFunctions = []
    const onCollideFunctions = []

    for (var i = 0; i < this.goController.gameObjects.length; i++) {
        const object = this.goController.gameObjects[i]
        if (!object.collider) continue

        let directionToMove = object.velocity
        if (!directionToMove || vector.length(directionToMove) === 0) continue
        const directionToMoveLength = vector.length(directionToMove)

        let nextPosition = {
            x: object.position.x + directionToMove.x * deltatime,
            y: object.position.y + directionToMove.y * deltatime,
        }
        let nextObj = Object.assign({}, object, { position: nextPosition })

        for (var n = 0; n < this.goController.gameObjects.length; n++) {
            if (!directionToMove || directionToMoveLength === 0) break
            if (i === n) continue

            const objectCmp = this.goController.gameObjects[n]
            if (!objectCmp.collider) continue

            const collision = this.circleCollision( nextObj, objectCmp )

            if (collision.status) {
                const dirCollisionInv = vector.reverse(collision.direction)
                if (object.onCollide) onCollideFunctions.push(_ => object.onCollide(objectCmp, collision.direction, dirCollisionInv))
                
                if (goTypes.isType(objectCmp.type, goTypes.OBSTACLE) || goTypes.isType(object.type, goTypes.OBSTACLE) ||
                    ( goTypes.isType(objectCmp.type, goTypes.PLAYER_OBSTACLE) && goTypes.isType(object.type, goTypes.PLAYER) ) ||
                    ( goTypes.isType(objectCmp.type, goTypes.PLAYER) && goTypes.isType(object.type, goTypes.PLAYER_OBSTACLE) ) ||
                    ( goTypes.isType(objectCmp.type, goTypes.SPELL_OBSTACLE) && goTypes.isType(object.type, goTypes.SPELL) ) ||
                    ( goTypes.isType(objectCmp.type, goTypes.SPELL) && goTypes.isType(object.type, goTypes.SPELL_OBSTACLE) )) {
                    directionToMove = vector.multiply(collision.direction, directionToMoveLength)
                }
            }
        }

        if (directionToMove && directionToMoveLength > 0) {
            movementFunctions.push(_ => {
                object.position.x += directionToMove.x * deltatime
                object.position.y += directionToMove.y * deltatime
            })
        }
    }

    for (let i = 0; i < movementFunctions.length; i++) movementFunctions[i]()
    for (let i = 0; i < onCollideFunctions.length; i++) onCollideFunctions[i]()
}

Physics.prototype.circleCollision = function (obj1, obj2) {
    const objectsDistance = Math.pow((obj1.position.x - obj2.position.x), 2) + Math.pow((obj1.position.y - obj2.position.y), 2)
    const radiusSum = Math.pow((obj1.collider.radius + obj2.collider.radius), 2)
    const fResult = radiusSum > objectsDistance
    if(!obj2.collider.thickness || !fResult) return { status: fResult, direction: fResult && vector.direction(obj2.position, obj1.position) }

    const object2Radius = Math.pow(obj2.collider.radius, 2)
    // If object is outside
    if(objectsDistance > object2Radius) return { status: true, direction: vector.direction(obj2.position, obj1.position) }

    const object2RadiusInside = Math.pow(obj2.collider.radius - obj2.collider.thickness, 2)
    if(objectsDistance <= object2RadiusInside) return { status: false }
    return { status: true, direction: vector.direction(obj1.position, obj2.position) }
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
