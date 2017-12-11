const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const vector = require('./utils/vector')

function MapController(goController) {
    this.goController = goController

    this.size = 300
    this.halfSize = this.size / 2
    this.damagePerSecond = 10
    this.position = {
        x: this.halfSize,
        y: this.halfSize,
    }
    this.obstacles = []
    this.obstacles.push( goController.createObstacle({ position: { x: 100, y: 100 }, size: 25 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 200, y: 100 }, size: 25 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 100, y: 200 }, size: 25 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 200, y: 200 }, size: 25 }) )
}

MapController.prototype.info = function() {
    return {
        size: this.size,
        obstacles: this.obstacles.map(x => x.info()),
        position: this.position
    }
}

MapController.prototype.update = function(deltatime) {
    const players = this.goController.gameObjects.filter(x => x.type === goTypes.PLAYER)
    for (var i = 0; i < players.length; i++) {
        const plDistance = vector.distance(players[i].position, this.position)
        if(plDistance > this.halfSize) {
            players[i].dealDamage(this.damagePerSecond * deltatime)
        }
    }
}

module.exports = MapController
