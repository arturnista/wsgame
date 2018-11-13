const _ = require('lodash')
const uuid = require('uuid')
const RoomTutorialBehaviour = require('./RoomTutorialBehaviour')
const GameObjectController = require('./GameObjects/GameObjectController')
const goTypes = require('./GameObjects/gameObjectTypes')
const Physics = require('./Physics')
const MapController = require('./Map/MapController')
const database = require('../Database').getDatabase()
const package = require('../../package.json')

const DELAY_TO_START = 4000
const DELAY_TO_END = 5000

const FPS = 60
const TICK_LENGTH_MS = 1000 / FPS

let COLORS = [
    '#ff0000',
    '#0000ff',
    '#00ffff',
    '#ff00ff',
    '#ffff00',
    '#ff8000',
    '#00ff00',
    '#ffaaaa',
    '#aaaaaa',
]

function Room(data, server, socketIo) {
    this.id = uuid.v4()
    
    this.server = server
    this.socketIo = socketIo

    this.name = data.name
    this.isPrivate = !!data.isPrivate || !!data.isTutorial
    this.port = this.server.address().port
    
    this.previousTick = Date.now()
    this.gameLoop = this.gameLoop.bind(this)
    this.gameLogic = this.gameLogic.bind(this)

    this.gameObjectController = new GameObjectController(this.addState.bind(this))
    this.mapController = new MapController(this.gameObjectController, this.addState.bind(this))
    this.physics = new Physics(this.gameObjectController)

    this.gameIsStarting = false
    this.gameIsRunning = false
    this.gameEnded = false
    this.cycleTime = null
    this.users = []
    this.chat = []
    this.owner = null
    this.startGameTime = null

    this.isTutorialRoom = data.isTutorial

    if(this.isTutorialRoom) {
        this.roomBehaviour = new RoomTutorialBehaviour(this)
    } else {
        this.roomBehaviour = null
    }

    this.nextState = {}
}

Room.prototype.delete = function () {
    console.log(`SocketIO :: ${this.name} :: Deleted`)

    this.gameIsStarting = false
    this.gameIsRunning = false
    this.gameEnded = false

    clearTimeout(this.cycleTime)

    this.gameObjectController.end(this.users)
    this.mapController.end()
    if(this.roomBehaviour) this.roomBehaviour.delete()

    while(this.users.length > 0) {
        this.userLeftRoom(this.users[0])
    }
}

Room.prototype.info = function () {
    return {
        name: this.name,
        port: this.port,
        private: this.isPrivate,
        owner: this.owner ? this.owner.info() : '',
        users: this.users.map(x => x.info()),
        chat: this.chat,
    }
}

Room.prototype.userOwner = function (user) {
    this.owner = user
}

Room.prototype.userJoin = function(user) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this

    if(this.users.find(x => x.id === user.id) != null) return

    this.users.push( user )

    user.color = _.sample(COLORS)
    user.gameObjectController = this.gameObjectController
    
    COLORS = COLORS.filter(x => x !== user.color)

    console.log(`SocketIO :: ${this.name} :: User joined :: ${user.id}`)
    user.socket.emit('myuser_joined_room', { room: this.info(), user: user.info() })
    this.emit('user_joined_room', { room: this.info(), user: user.info() })

    // Room events
    user.socket.on('room_kick_user', (message) => {
        if(this.gameIsRunning) return
        if(this.owner.id !== user.id) return
        if(message.userId === user.id) return

        console.log(`SocketIO :: ${this.name} :: User kicked :: ${JSON.stringify(message)}`)
        const kUser = this.users.find(x => x.id === message.userId)
        if(kUser) this.userLeftRoom(kUser)
    })

    // User events
    user.socket.on('user_ready', (message) => {
        if(this.gameIsRunning) return

        if(user.status !== 'ready') {
            console.log(`SocketIO :: ${this.name} :: Player ready :: ${JSON.stringify(message)}`)
            user.status = 'ready'
            this.emit('user_ready', { user: user.id })
        }
    })
    user.socket.on('user_waiting', (message) => {
        if(this.gameIsRunning) return

        if(user.status !== 'waiting') {
            console.log(`SocketIO :: ${this.name} :: Player waiting :: ${JSON.stringify(message)}`)
            user.status = 'waiting'
            this.emit('user_waiting', { user: user.id })
        }
    })

    user.socket.on('user_become_observer', (message) => {
        if(this.gameIsRunning) return
        
        console.log(`SocketIO :: ${this.name} :: User become observer :: ${JSON.stringify(message)}`)
        user.isObserver = true
        this.emit('room_update', { room: this.info() })
    })

    user.socket.on('user_become_player', (message) => {
        if(this.gameIsRunning) return
        
        console.log(`SocketIO :: ${this.name} :: User become player :: ${JSON.stringify(message)}`)
        user.isObserver = false
        this.emit('room_update', { room: this.info() })
    })

    user.socket.on('user_select_spell', (message, responseCallback) => {
        if(this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player selected spell :: ${JSON.stringify(message)}`)
        const spellData = user.selectSpell(message)
        if(spellData) {
            this.emit('user_selected_spell', { user: user.id, spellName: message.spellName, position: message.position, spellData })
            responseCallback({ status: 200 })
        } else {
            responseCallback({ status: 400 })
        }
    })

    user.socket.on('user_deselect_spell', (message, responseCallback) => {
        if(this.gameIsRunning) return

        console.log(`SocketIO :: ${this.name} :: Player deselected spell :: ${JSON.stringify(message)}`)
        const result = user.deselectSpell(message)
        if(result) {
            this.emit('user_deselected_spell', { user: user.id, spellName: message.spellName })
            responseCallback({ status: 200 })
        } else {
            responseCallback({ status: 400 })
        }
    })

    user.socket.on('user_submit_message', (message) => {
        console.log(`SocketIO :: ${this.name} :: Player submit message :: ${JSON.stringify(message)}`)
        const user = this.users.find(x => x.id === message.user)
        this.chat.push({
            id: user.id,
            message: message.message,
            color: user.color,
            name: user.name,
            createdAt: (new Date()).toISOString(),
        })
        this.emit('room_chat_new_message', { chat: this.chat })
    })

    // Player events
    user.socket.on('player_move', (message) => {
        if(!this.gameIsRunning) return
        if(user.isObserver) return
        console.log(`SocketIO :: ${this.name} :: Player move :: ${JSON.stringify(message)}`)
        if(user.player && user.player.status === 'alive') user.player.setPositionToGo(message.position)
    })

    user.socket.on('player_spell', (message) => {
        if(!this.gameIsRunning) return
        if(user.isObserver) return
        
        console.log(`SocketIO :: ${this.name} :: Player used ${message.spellName} :: ${JSON.stringify(message)}`)
        if(user.player) user.player.useSpell(message.spellName, message)
    })

    // Game events
    user.socket.on('game_start', (message, responseCallback) => {
        if(this.gameIsRunning || this.gameIsStarting) return
        console.log(`SocketIO :: ${this.name} :: Game start :: ${JSON.stringify(message)}`)
        if(this.owner.id !== user.id) return

        this.startGame(message, responseCallback)
    })

    user.socket.on('game_restart', (message) => {
        console.log(`SocketIO :: ${this.name} :: Game restarted :: ${JSON.stringify(message)}`)
        if(this.owner.id !== message.id) return

    })

    if(user.id === this.owner.id && this.isTutorialRoom) {
        user.status = 'ready'
        user.spells = []
        this.startGame({
            botCount: 0,
            map: 'TutorialArena',
        }, () => {})
    }

}

Room.prototype.userLeftRoom = function (user) {
    COLORS.push( user.color )

    this.emit('user_left_room', user.info())
    user.reset()
    user.socket.disconnect()

    if(user.player) this.gameObjectController.destroyPlayer(user.player.id)
    this.users = this.users.filter(x => x.id !== user.id)
}

Room.prototype.startGame = function (data, responseCallback) {
    const availableUsers = this.users.filter(x => !x.isObserver)
    if(data.botCount === 0 && availableUsers.length === 0) {
        responseCallback({ error: 'NO_USERS' })
        return
    }

    this.FPS = data.fps || 60
    this.TICK_LENGTH_MS = 1000 / this.FPS
    
    this.gameIsStarting = true
    
    const usersReady = availableUsers.every(x => x.status === 'ready')
    if(usersReady || (availableUsers.length === 0 && data.botCount > 0)) {

        this.saveUsers(availableUsers)
        .then(() => {
            const players = this.gameObjectController.start(this.users, { addState: this.addState.bind(this), mapController: this.mapController, botCount: data.botCount || 0 })
            this.mapController.start(data && data.map)
            if(this.roomBehaviour) this.roomBehaviour.start(players)

            this.emit('game_will_start', { time: DELAY_TO_START, map: this.mapController.info() })
            setTimeout(() => {
                this.emit('map_create', this.mapController.info())
                this.startGameTime = new Date()

                this.gameIsStarting = false
                this.gameIsRunning = true
                this.previousTick = Date.now()
                this.gameLoop()

                this.emit('game_start', { players: players.map(x => x.info()) })
            }, DELAY_TO_START)
        })
    } else {
        this.gameIsStarting = false
        responseCallback({ error: 'NOT_READY' })        
    }
}

Room.prototype.saveUsers = function(availableUsers) {
    if(this.isTutorialRoom) return Promise.resolve()
    return Promise.all(availableUsers.map(u => u.saveSpells()))
}

Room.prototype.endGame = function (winner) {
    const userWinner = this.users.find(x => !x.player || !winner ? false : x.player.id === winner.id)
    const usersIds = {}
    this.users.forEach(x => {usersIds[x.id] = true})

    if(!this.isTutorialRoom) {
        const gameData = {
            version: package.version,
            room: {
                id: this.id,
                name: this.name
            }, 
            winner: {
                isDraw: !winner,
                player: winner ? winner.id : '',
                user: userWinner ? userWinner.id: '',
            }, 
            users: {
                data: this.users.map(x => ({ id: x.id, name: x.name })),
                ids: usersIds,
            },
            players: this.gameObjectController.gameObjects.filter(x => goTypes.isType(x.type, goTypes.PLAYER))
                .map(p => ({ id: p.id, user: p.user ? p.user.id : 'bot', isBot: !!p.botBehaviour, spells: p.spellsUsed, life: p.life, knockbackValue: p.knockbackValue })),
            map: this.mapController.currentMap.name,
            duration: new Date() - this.startGameTime,
            createdAt: (new Date()).toISOString(),
        }
        database.collection('/games').add(gameData)
    }

    this.gameObjectController.end(this.users, winner)
    this.mapController.end()

    this.emit('game_end', { users: this.users.map(x => x.info()) })

    this.gameIsRunning = false
    this.gameEnded = false

    if(this.isTutorialRoom) this.userLeftRoom(this.users[0])
    else {
        this.users.forEach(u => {
            u.saveGame(!userWinner ? false : u.id === userWinner.id, this.users)
            u.status = 'waiting'
        })
    }
}

Room.prototype.gameLoop = function() {
    if(!this.gameIsRunning) return

    const now = Date.now()

    if (this.previousTick + this.TICK_LENGTH_MS <= now) {
        const delta = (now - this.previousTick) / 1000
        this.previousTick = now

        this.gameLogic(delta)
    }

    if (Date.now() - this.previousTick < this.TICK_LENGTH_MS - 16) {
        setTimeout(this.gameLoop)
    } else {
        setImmediate(this.gameLoop)
    }
}

Room.prototype.gameLogic = function (deltatime) {
    const {
        gameObjectController,
        mapController,
        physics
    } = this

    if(!this.gameIsRunning) return

    physics.update(deltatime)
    gameObjectController.update(deltatime)
    mapController.update(deltatime)

    const infos = gameObjectController.allInfos()
    this.emit('game_state', { ...this.nextState, entities: infos })
    this.nextState = {}

    if(this.gameEnded) return

    if(this.roomBehaviour) {
        const result = this.roomBehaviour.update(deltatime)
        if(result.ignoreEndGame) return
    }

    const alivePlayers = infos.players.filter(x => x.status === 'alive')
    if(alivePlayers.length <= 1) {
        this.gameEnded = true
        this.emit('game_will_end', { time: DELAY_TO_END, winner: alivePlayers[0] })
        setTimeout(() => this.endGame(alivePlayers[0]), DELAY_TO_END)
    }
}

Room.prototype.addState = function(type, data) {
    if(!this.nextState[type]) this.nextState[type] = []
    this.nextState[type].push(data)
}

Room.prototype.emit = function(name, data) {
    const emitData = data || {}
    emitData.sendTime = (new Date()).toISOString()

    if(!this.isBlockMode) {
        this.socketIo.emit(name, emitData)
    } else {
        this.users.forEach(u => u.socket.emit(name, emitData))
    }
}

module.exports = Room
