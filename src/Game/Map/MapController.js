const _ = require('lodash')
const TutorialArena = require('./TutorialArena')
const BasicArena = require('./BasicArena')
const FireArena = require('./FireArena')
const Grid = require('./Grid')

const MAPS = {
    TutorialArena,
    BasicArena,
    FireArena,
    Grid,
}
const AVAILABLE_FOR_RANDOM = [
    'BasicArena',
    'FireArena',
]


function MapController(goController, addState) {
    this.addState = addState
    this.goController = goController
    this.currentMap = null
}

MapController.prototype.selectCurrentMap = function(map) {
    let MapToCreate = function () {}

    if(!_.isNil(MAPS[map])) {
        MapToCreate = MAPS[map]
    } else {
        const randomKey = _.sample(AVAILABLE_FOR_RANDOM)
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
        this.addState('map_update', this.info())
    }
}

module.exports = MapController
