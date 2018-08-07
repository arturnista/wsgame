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
        return admin.firestore().collection('/bug_reports').add(data)
        .then(res => ({ id: result.id, ...data }))
    },
}

module.exports = {
    translator,
}