const moment = require('moment')
const express = require('express')
const server = express()
const http = require('http').Server(server)

server.set('views', __dirname + '')
server.engine('html', require('ejs').renderFile)

const WebSocket = require('./src/WebSocket')
const packageJson = require('./package.json')

server.get('/', function(req, res, next) {
    const now = moment()
    res.status(200).json({
        name: 'Gameserver',
        version: packageJson.version,
        status: 200,
        now: now.toISOString(),
        unix_now: now.unix()
    })
})

server.get('/site', function(req, res, next) {
    res.render('site/build/index.html')
})

server.get('/static/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/build/static/${req.params.filetype}/${req.params.filename}`
    res.sendFile(filename)
})

server.get('/game', function (req, res) {
    res.render('game/index.html')
})

server.get('/Build/:arq', function (req, res) {
    const arq = req.params.arq
    res.sendFile(__dirname + "/game/Build/" + arq)
})

const port = process.env.PORT || 5002
http.listen(port, function() {
    console.log('Gameserver API running! Port: ' + port)
})
WebSocket.connect(http)
