const _ = require('lodash')
const goTypes = require('../GameObjects/gameObjectTypes')
const vector = require('../../utils/vector')

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
            this.blocks.push({ status: 'normal', size: blockSize, position: { x: xF, y: yF } })
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
        switch (block) {
            case 'toDestroy':
                status = 'destroyed'
                break
            case 'toRevive':
                status = 'normal'
                break
            case 'normal':
                const shouldDestroy = Math.random() >= 0.3
                if(shouldDestroy) status = 'toDestroy'
                break
            case 'destroyed':
                const shoudRevive = Math.random() >= 0.3
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

        const plDistance = vector.distance(players[i].position, this.position)
        if(plDistance > this.halfSize) {
            // players[i].dealDamage(this.damagePerSecond * deltatime)
        }
    }

    this._timePassed += deltatime
    if(this._timePassed > this.timeToUpdate) {
        this._timePassed = 0

        this.nextStep()
        shouldUpdate = true
        console.log('update')
    }

    return shouldUpdate
}


module.exports = Grid
