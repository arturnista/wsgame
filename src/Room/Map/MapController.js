const _ = require('lodash')
const BasicArena = require('./BasicArena')
const FireArena = require('./FireArena')

const MAPS = [
    BasicArena,
    FireArena
]

function MapController(goController, emit) {
    this.emit = emit
    this.goController = goController
}

MapController.prototype.selectCurrentMap = function() {
    const RandomMap = MAPS[ _.random(0, MAPS.length - 1) ]
    this.currentMap = new RandomMap(this.goController)
}

MapController.prototype.start = function() {
    this.selectCurrentMap()
    this.currentMap.start()

    this.status = 'ready'
}

MapController.prototype.end = function() {
    this.status = 'waiting'
}

MapController.prototype.info = function() {
    return this.currentMap.info()
}

MapController.prototype.update = function(deltatime) {
    if(this.status === 'waiting') return

    let shouldUpdate = this.currentMap.update(deltatime)
    if(shouldUpdate) {
        this.emit('map_update', this.info())
    }
}

module.exports = MapController
