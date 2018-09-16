const _ = require('lodash')
const goTypes = require('../GameObjects/gameObjectTypes')
const vector = require('../../utils/vector')

const DECREASE_INCREMENT = 5

function TutorialArena(goController) {
    this.goController = goController
    this.name = 'Basic Arena'
}

TutorialArena.prototype.prepare = function() {
    this.damagePerSecond = 5
    this.size = 500
    this.halfSize = this.size / 2

    this.position = {
        x: this.halfSize,
        y: this.halfSize,
    }

    this.obstacles = []
    this.obstacles.push( this.goController.createObstacle({ position: { x: 250, y: 250 }, size: 30 }) )

    this.spawnPoints = []
    this.spawnPoints.push( { x: 100, y: 100 } )
    this.spawnPoints.push( { x: 400, y: 400 } )
    this.spawnPoints.push( { x: 100, y: 400 } )
    this.spawnPoints.push( { x: 400, y: 100 } )
    this.spawnPoints.push( { x: 200, y: 200 } )
    this.spawnPoints.push( { x: 400, y: 200 } )
    this.spawnPoints.push( { x: 200, y: 400 } )
    this.spawnPoints.push( { x: 200, y: 100 } )
    this.spawnPoints.push( { x: 100, y: 200 } )

    this.decreasePerSecond = 0
    this.timeToUpdate = 15
    this._timePassed = 0
    this.decreaseActive = false
}

TutorialArena.prototype.start = function() {
    this.prepare()

    for (var i = 0; i < this.goController.gameObjects.length; i++) {
        const player = this.goController.gameObjects[i]
        if(!goTypes.isType(player.type, goTypes.PLAYER)) continue

        if(i < this.spawnPoints.length) player.position = this.spawnPoints[i]
        else player.position = this.getRandomPosition()
    }
}

TutorialArena.prototype.getRandomPosition = function() {

    const mapPos = this.position
    const mapSize = this.size / 2
    return {
        x: _.random(mapPos.x - mapSize, mapPos.x + mapSize),
        y: _.random(mapPos.y - mapSize, mapPos.y + mapSize),
    }

}

TutorialArena.prototype.info = function() {
    return {
        name: this.name,
        size: this.size,
        obstacles: this.obstacles.map(x => x.info()),
        position: this.position,
        decreasePerSecond: this.decreasePerSecond,
        timeToUpdate: this.timeToUpdate
    }
}

TutorialArena.prototype.update = function(deltatime) {
    let shouldUpdate = false
    const players = this.goController.gameObjects.filter(x => goTypes.isType(x.type, goTypes.PLAYER))
    for (var i = 0; i < players.length; i++) {
        if(players[i].status !== 'alive') continue

        const plDistance = vector.distance(players[i].position, this.position)
        if(plDistance > this.halfSize) {
            players[i].dealDamage(this.damagePerSecond * deltatime)
        }
    }

    if(this.decreaseActive) {
        this._timePassed += deltatime
        if(this._timePassed > this.timeToUpdate) {
            this._timePassed = 0
    
            this.damagePerSecond *= 2
            this.decreasePerSecond += DECREASE_INCREMENT
            shouldUpdate = true
        }
    }

    if(this.decreasePerSecond > 0) {
        this.size -= this.decreasePerSecond * deltatime
        if(this.size < 0) this.size = 0
        this.halfSize = this.size / 2
    }

    return shouldUpdate
}


module.exports = TutorialArena
