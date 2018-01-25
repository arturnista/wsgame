const _ = require('lodash')
const BasicArena = require('./BasicArena')
const FireArena = require('./FireArena')
const Grid = require('./Grid')

const MAPS = {
    BasicArena,
    FireArena,
    Grid,
}


function MapController(goController, emit) {
    this.emit = emit
    this.goController = goController
    this.currentMap = null
}

MapController.prototype.selectCurrentMap = function(map) {
    let MapToCreate = function () {}

    if(!_.isNil(MAPS[map])) {
        MapToCreate = MAPS[map]
    } else {
        const keys = Object.keys(MAPS)
        const randomKey = keys[ _.random(0, keys.length - 1) ]
        MapToCreate = MAPS[randomKey]
    }

    this.currentMap = new MapToCreate(this.goController)
}

MapController.prototype.start = function(map) {
    this.selectCurrentMap(map)
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
