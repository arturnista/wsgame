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
    putConfig: function(req, res, next) {
        interactor.updateConfig(req.params.id, req.body)
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
    },
    updateConfig: function(id, config) {
        return entity.getOne(id)
        .then(userData => entity.updateConfig(id, Object.assign({}, userData.config, config)))
    }
}

const entity = {
    getOne: function(id) {
        return adapter.getOne(id)
    },
    updateConfig: function(id, config) {
        return adapter.updateConfig(id, config)
    }
}

const adapter = {
    getOne: function(id) {
        return database.collection('/users').doc(id).get()
        .then(fsUser => fsUser.exists ? Object.assign({ id: fsUser.id }, fsUser.data()) : { error: 'NOT_FOUND' })
    },
    updateConfig: function(id, config) {
        return database.collection('/users').doc(id).update({ id, config })
    },
}

module.exports = {
    translator,
    interactor
}