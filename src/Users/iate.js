const database = require('../Database').getDatabase()

const translator = {
    getOne: function(req, res, next) {
        interactor.getOne(req.params.id)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }, 
    putPreferences: function(req, res, next) {
        interactor.updatePreferences(req.params.id, req.body)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }
}

const interactor = {
    getOne: function(id) {
        return entity.getOne(id)
        .then(user => {
            return entity.getGames(id)
            .then(games => {
                user.games = games
                return user
            })
        })
    },
    updatePreferences: function(id, preferences) {
        return entity.getOne(id)
        .then(userData => entity.updatePreferences(id, Object.assign({}, userData.preferences, preferences)))
    },
    updateGames: function(id, status) {
        return entity.getOne(id)
        .then(userData => {
            const newStatus = Object.assign({}, userData.status, { games: userData.status.games + status.games, wins: userData.status.wins + (status.isWinner ? 1 : 0) })
            return entity.updateStatus(id, newStatus)
        })
    }
}

const entity = {
    getOne: function(id) {
        return adapter.getOne(id)
    },
    getGames: function(id) {
        return adapter.getGames(id)
    },
    updatePreferences: function(id, preferences) {
        return adapter.update(id, { preferences })
    },
    updateStatus: function(id, status) {
        return adapter.update(id, { status })
    }
}

const adapter = {
    getOne: function(id) {
        return database.collection('/users').doc(id).get()
        .then(fsUser => fsUser.exists ? Object.assign({ id: fsUser.id }, fsUser.data()) : { error: 'NOT_FOUND' })
    },
    getGames: function(id) {
        return database.collection('/games').where(`users.ids.${id}`, '==', true).get()
        .then(fsGames => {
            if(!fsGames) return []
            
            let games = []
            fsGames.forEach(doc => games.push(Object.assign({ id: doc.id }, doc.data())))
            return games
        })
    },
    update: function(id, data) {
        return database.collection('/users').doc(id).update(data)
    },
}

module.exports = {
    translator,
    interactor
}