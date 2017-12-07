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
            let collided = false
            if(object.collider.type === objectCmp.collider.type) {
                if(object.collider.type === 'circle') {
                    collided = this.circleCollision(object, objectCmp)
                } else if(object.collider.type === 'box') {
                    collided = this.boxCollision(object, objectCmp)
                }
            } else {

            }

            if(collided) {
                setImmediate(object.onCollide.bind(object), objectCmp)
            }
        }
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

Physics.prototype.multipleCollision = function (obj1, obj2) {
    const circle = obj1.collider.type === 'circle' ? obj1 : obj2
    const box = obj1.collider.type === 'box' ? obj1 : obj2

    const boxEdges = box.collider.edges(box.position)
    
    const obj2Edges = obj2.collider.edges(obj2.position)

    if (obj1Edges.max.x <= obj2Edges.min.x) return false // a is left of b
    if (obj1Edges.min.x >= obj2Edges.max.x) return false // a is right of b
    if (obj1Edges.max.y <= obj2Edges.min.y) return false // a is above b
    if (obj1Edges.min.y >= obj2Edges.max.y) return false // a is below b

    return true // boxes overlap
}

module.exports = Physics
