const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const vector = require('./utils/vector')

function MapController(goController) {
    this.goController = goController

    this.size = 300
    this.obstacles = []
    this.obstacles.push( goController.createObstacle({ position: { x: 100, y: 100 }, size: 25 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 200, y: 100 }, size: 25 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 100, y: 200 }, size: 25 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 200, y: 200 }, size: 25 }) )
}

MapController.prototype.info = function() {
    return {
        size: this.size,
        obstacles: this.obstacles.map(x => x.info())
    }
}

module.exports = MapController
