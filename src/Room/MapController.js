const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const vector = require('../utils/vector')

const DECREASE_INCREMENT = 3

function MapController(goController, socketIo) {
    this.goController = goController
    this.socketIo = socketIo

    this.obstacles = []
    this.obstacles.push( goController.createObstacle({ position: { x: 150, y: 150 }, size: 50 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 350, y: 150 }, size: 20 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 150, y: 350 }, size: 20 }) )
    this.obstacles.push( goController.createObstacle({ position: { x: 350, y: 350 }, size: 50 }) )

    this.spawnPoints = []
    this.spawnPoints.push( { x: 100, y: 100 } )
    this.spawnPoints.push( { x: 400, y: 100 } )
    this.spawnPoints.push( { x: 100, y: 400 } )
    this.spawnPoints.push( { x: 400, y: 400 } )

    this.prepare()
    this.status = 'waiting'
}

MapController.prototype.prepare = function() {
    this.damagePerSecond = 5
    this.size = 500
    this.halfSize = this.size / 2
    this.position = {
        x: this.halfSize,
        y: this.halfSize,
    }

    this.decreasePerSecond = 0
    this.timeToUpdate = 60
    this._timePassed = 0
}

MapController.prototype.start = function() {
    this.prepare()

    for (var i = 0; i < this.goController.gameObjects.length; i++) {
        const player = this.goController.gameObjects[i]
        if(player.type !== goTypes.PLAYER) continue

        player.position = this.spawnPoints[i]
    }
    
    this.status = 'ready'
}

MapController.prototype.restart = function() {
    this.prepare()
    this.status = 'waiting'
}

MapController.prototype.info = function() {
    return {
        size: this.size,
        obstacles: this.obstacles.map(x => x.info()),
        position: this.position,
        decreasePerSecond: this.decreasePerSecond,
        timeToUpdate: this.timeToUpdate
    }
}

MapController.prototype.update = function(deltatime) {
    if(this.status === 'waiting') return

    const players = this.goController.gameObjects.filter(x => x.type === goTypes.PLAYER)
    for (var i = 0; i < players.length; i++) {
        const plDistance = vector.distance(players[i].position, this.position)
        if(plDistance > this.halfSize) {
            players[i].dealDamage(this.damagePerSecond * deltatime)
        }
    }

    this._timePassed += deltatime
    if(this._timePassed > this.timeToUpdate) {
        this._timePassed = 0

        this.damagePerSecond *= 2
        this.decreasePerSecond += DECREASE_INCREMENT

        this.socketIo.emit('map_update', this.info())
    }

    if(this.decreasePerSecond > 0) {
        this.size -= this.decreasePerSecond * deltatime
        this.halfSize = this.size / 2
    }
}

module.exports = MapController