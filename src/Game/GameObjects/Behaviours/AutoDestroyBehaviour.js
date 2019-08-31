const _ = require('lodash')
const goTypes = require('../gameObjectTypes')
const vector = require('../../../utils/vector')
const colliders = require('../../Physics/colliders')

function AutoDestroyBehaviour(spell, goController, time) {

    this.lifeTime = time
    this._timePassed = 0

    this.spell = spell

    this.goController = goController

}


AutoDestroyBehaviour.prototype.update = function (deltatime) {

    this._timePassed += deltatime
    if(this._timePassed >= this.lifeTime) {
        this.goController.destroy(this.spell.id)
    }

}

module.exports = AutoDestroyBehaviour
