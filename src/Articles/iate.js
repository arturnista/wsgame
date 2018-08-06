const database = require('../Database').getDatabase()

const translator = {
    getAll: function(req, res, next) {
        interactor.getAll()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }
}

const interactor = {
    getAll: function() {
        return entity.getAll()
    }
}

const entity = {
    getAll: function() {
        return adapter.getAll()
        .then(result => result.map(x => Object.assign(x, { content: x.content.replace(/\\n/g, '\n') })))
    }
}

const adapter = {
    getAll: function() {
        return database.collection('/articles').get()
        .then(fsArticles => {
            if(!fsArticles) return []
            
            let articles = []
            fsArticles.forEach(doc => articles.push(Object.assign({ id: doc.id }, doc.data())))
            return articles
        })
    },
}

module.exports = {
    translator,
}