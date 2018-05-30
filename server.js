const moment = require('moment')
const express = require('express')
const cors = require('cors')
const server = express()
const http = require('http').Server(server)

var whitelist = ['http://localhost:3000']
var corsOptionsDelegate = function (req, callback) {
    const corsOptions = { origin: whitelist.indexOf(req.header('Origin')) !== -1 }
    callback(null, corsOptions)
}
server.use(cors(corsOptionsDelegate))

server.set('views', __dirname + '')
server.engine('html', require('ejs').renderFile)

const WebSocket = require('./src/WebSocket')
const packageJson = require('./package.json')


server.get('/', function(req, res, next) {
    res.render('site/index.html')
})
server.get('/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/${req.params.filetype}/${req.params.filename}`
    res.sendFile(filename)
})
server.get('/static/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/static/${req.params.filetype}/${req.params.filename}`
    res.sendFile(filename)
})

server.get('/rooms', function(req, res, next) {
    res.status(200).json( WebSocket.getRooms() )
})

server.get('/spells', function(req, res, next) {
    res.status(200).json( WebSocket.getSpells() )
})

const port = process.env.PORT || 5002
http.listen(port, function() {
    console.log('Gameserver API running! Port: ' + port)
})
WebSocket.connect(http)
