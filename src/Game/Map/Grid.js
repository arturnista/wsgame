const _ = require('lodash')
const goTypes = require('../GameObjects/gameObjectTypes')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

const DECREASE_INCREMENT = 3
const DAMAGE_INCREASE = 2

function Grid(goController) {
    this.goController = goController
    this.name = 'Grid'
}

Grid.prototype.prepare = function() {
    this.damagePerSecond = 5

    this.obstacles = []
    let obstacleMaxCount = 3
    let obstacleCount = 0

    this.blocks = []
    let blockSize = 125
    let gridSize = 4
    let lastCreatedY
    for (let x = 0; x < gridSize; x++) {
        let createdInRow = false

        for (let y = 0; y < gridSize; y++) {
            const xF = (blockSize / 2) + (blockSize * x)
            const yF = (blockSize / 2) + (blockSize * y)
            const edges = colliders.createBox(blockSize).edges({ x: xF, y: yF })
            this.blocks.push({ status: 'normal', size: blockSize, position: { x: xF, y: yF }, edges })
            
            if(!createdInRow && lastCreatedY !== y && Math.random() < 0.3 && obstacleCount < obstacleMaxCount) {
                this.obstacles.push( this.goController.createObstacle({ position: { x: xF, y: yF }, size: (Math.random() * 10) + 10 }) )
                obstacleCount++

                createdInRow = true
                lastCreatedY = y
            }
        }
    }

    this.size = blockSize * gridSize
    this.halfSize = this.size / 2

    this.position = {
        x: this.halfSize,
        y: this.halfSize,
    }

    this.spawnPoints = []
    this.spawnPoints.push( { x: 100, y: 100 } )
    this.spawnPoints.push( { x: 400, y: 400 } )
    this.spawnPoints.push( { x: 400, y: 100 } )
    this.spawnPoints.push( { x: 100, y: 400 } )

    this.timeToUpdate = 10
    this._timePassed = 0
}

Grid.prototype.start = function() {
    this.prepare()

    for (var i = 0; i < this.goController.gameObjects.length; i++) {
        const player = this.goController.gameObjects[i]
        if(!goTypes.isType(player.type, goTypes.PLAYER)) continue

        if(i < this.spawnPoints.length) player.position = this.spawnPoints[i]
        else player.position = this.getRandomPosition()
    }
}

Grid.prototype.getRandomPosition = function() {

    const mapPos = this.position
    const mapSize = this.size / 2
    return {
        x: _.random(mapPos.x - mapSize, mapPos.x + mapSize),
        y: _.random(mapPos.y - mapSize, mapPos.y + mapSize),
    }

}

Grid.prototype.info = function() {
    return {
        name: this.name,
        size: this.size,
        blocks: this.blocks,
        position: this.position,
        obstacles: this.obstacles.map(x => x.info()),
        timeToUpdate: this.timeToUpdate,
    }
}

Grid.prototype.nextStep = function() {
    this.blocks = this.blocks.map(block => {
        let status = block.status
        switch (status) {
            case 'toDestroy':
                status = 'destroyed'
                break
            case 'toRevive':
                status = 'normal'
                break
            case 'normal':
                const shouldDestroy = Math.random() >= 0.8
                if(shouldDestroy) status = 'toDestroy'
                break
            case 'destroyed':
                const shoudRevive = Math.random() >= 0.8
                if(shoudRevive) status = 'toRevive'
                break
        }
        return Object.assign({}, block, {status})
    })

    this.damagePerSecond += DAMAGE_INCREASE
}

Grid.prototype.update = function(deltatime) {
    let shouldUpdate = false
    const players = this.goController.gameObjects.filter(x => goTypes.isType(x.type, goTypes.PLAYER))
    for (var i = 0; i < players.length; i++) {
        if(players[i].status !== 'alive') continue

        const isInside = this.blocks.find(block => {
            if(block.status != 'normal' && block.status != 'toDestroy') return false

            if (players[i].position.x > block.edges.max.x) return false // a is left of b
            if (players[i].position.x < block.edges.min.x) return false // a is right of b
            if (players[i].position.y > block.edges.max.y) return false // a is above b
            if (players[i].position.y < block.edges.min.y) return false // a is below b

            return true // boxes overlap
        })

        if(isInside == null) {
            players[i].dealDamage(this.damagePerSecond * deltatime)
        }
    }

    this._timePassed += deltatime
    if(this._timePassed > this.timeToUpdate) {
        this._timePassed = 0

        this.nextStep()
        shouldUpdate = true
    }

    return shouldUpdate
}


module.exports = Grid
