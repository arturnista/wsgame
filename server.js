const express = require('express')
const cors = require('cors')
const server = express()
const bodyParser = require('body-parser')

const figlet = require('figlet')

const http = require('http')
const https = require('https')
const fs = require('fs')

// require('./redirect')

const GameController = require('./src/Game/GameController')
const Articles = require('./src/Articles/iate')
const BugReports = require('./src/BugReports/iate')
const Users = require('./src/Users/iate')

const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'https://nwgame.pro', 'http://nwgame.pro', 'http://191.235.86.235', 'http://magearena.com', 'https://magearena.com']
const corsOptionsDelegate = function (req, callback) {
    // callback(null, {})
    const corsOptions = { origin: whitelist.indexOf(req.header('Origin')) !== -1 }
    callback(null, corsOptions)
}
server.use(cors(corsOptionsDelegate))
server.use(bodyParser.json())

server.set('views', __dirname + '')
server.engine('html', require('ejs').renderFile)

server.get('/', function(req, res, next) {
    res.render('site/index.html')
})
server.get('/whatsnew', function(req, res, next) {
    res.render('site/index.html')
})
server.get('/bugreport', function(req, res, next) {
    res.render('site/index.html')
})
server.get('/room', function(req, res, next) {
    return res.redirect(301, '/')
})
server.get('/game', function(req, res, next) {
    return res.redirect(301, '/')
})
server.get('/profile', function(req, res, next) {
    return res.redirect(301, '/')
})


server.get('/rooms', function(req, res, next) {
    console.log('Http Req :: Get Rooms :: ' + req.headers.origin)
    res.status(200).json( GameController.getRooms() )
})
server.post('/rooms', function(req, res, next) {
    console.log('Http Req :: Post Rooms :: ' + req.headers.origin)
    
    const isBlockMode = req.query.blockMode === 'true'
    const data = GameController.createRoom(req.body, {
        isBlockMode,
        server: isBlockMode ? httpServer : null
    })
    res.status(200).json(data)
})

server.get('/spells', function(req, res, next) {
    console.log('Http Req :: Get Spells :: ' + req.headers.origin)
    res.status(200).json( GameController.getSpells() )
})

server.get('/articles', function(req, res, next) {
    console.log('Http Req :: Get Articles :: ' + req.headers.origin)
    Articles.translator.getAll(req, res, next)
})

server.get('/users/:id', function(req, res, next) {
    console.log('Http Req :: Get User :: ' + req.headers.origin)
    Users.translator.getOne(req, res, next)
})
server.put('/users/:id/preferences', function(req, res, next) {
    console.log('Http Req :: Put preferences User :: ' + req.headers.origin)
    Users.translator.putPreferences(req, res, next)
})

server.post('/bugreports', function(req, res, next) {
    console.log('Http Req :: Post BugReports :: ' + req.headers.origin)
    BugReports.translator.post(req, res, next)
})

server.get('/:filetype/:filesubtype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/${req.params.filetype}/${req.params.filesubtype}/${req.params.filename}`
    res.sendFile(filename)
})
server.get('/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/${req.params.filetype}/${req.params.filename}`
    res.sendFile(filename)
})
server.get('/static/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/static/${req.params.filetype}/${req.params.filename}`
    res.sendFile(filename)
})

const port = 5000
let httpServer = null

const startCallback = function() {
    console.log(figlet.textSync('\nMage Arena', 'Delta Corps Priest 1'));
    console.log(`Server running on port ${port}\n\n`);
}

if(process.env.NODE_ENV === 'DEV' || process.env.PROTOCOL === 'HTTP') {

    httpServer = http.Server(server)
    httpServer.listen(port, startCallback)

} else {

    const sslOptions = {
        key: fs.readFileSync('./ssl/server.key'),
        cert: fs.readFileSync('./ssl/cert.crt'),
        ca: [fs.readFileSync('./ssl/gd1.cert', 'utf8'),
            fs.readFileSync('./ssl/gd2.cert', 'utf8')]
    }
    httpServer = https.Server(sslOptions, server)
    httpServer.listen(port, startCallback)

}