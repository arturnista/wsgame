const _ = require('lodash')
const goTypes = require('../GameObjects/gameObjectTypes')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')

const DECREASE_INCREMENT = 3

function Grid(goController) {
    this.goController = goController
    this.name = 'Grid'
}

Grid.prototype.prepare = function() {
    this.damagePerSecond = 5

    this.blocks = []
    let blockSize = 200
    let gridSize = 4
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const xF = (blockSize / 2) + (blockSize * x)
            const yF = (blockSize / 2) + (blockSize * y)
            const edges = colliders.createBox(blockSize).edges({ x: xF, y: yF })
            this.blocks.push({ status: 'normal', size: blockSize, position: { x: xF, y: yF }, edges })
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
        if(player.type !== goTypes.PLAYER) continue

        player.position = this.spawnPoints[i]
    }
}

Grid.prototype.info = function() {
    return {
        name: this.name,
        size: this.size,
        blocks: this.blocks,
        position: this.position,
        timeToUpdate: this.timeToUpdate
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
}

Grid.prototype.update = function(deltatime) {
    let shouldUpdate = false
    const players = this.goController.gameObjects.filter(x => x.type === goTypes.PLAYER)
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
