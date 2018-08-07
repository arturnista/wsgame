const database = require('../Database').getDatabase()

const translator = {
    post: function(req, res, next) {
        interactor.create(req.body)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }
}

const interactor = {
    create: function(data) {
        data.date = (new Date()).toISOString()
        return entity.create(data)
    }
}

const entity = {
    create: function(data) {
        return adapter.create(data)
    }
}

const adapter = {
    create: function(data) {
        return database.collection('/bug_reports').add(data)
        .then(res => Object.assign({ id: res.id }, data))
    },
}

module.exports = {
    translator,
}