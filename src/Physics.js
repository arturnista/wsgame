const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const vector = require('./utils/vector')

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

}

module.exports = Physics
