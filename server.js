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

server.get('/rooms', function(req, res, next) {
    res.status(200).json( WebSocket.getRooms() )
})

server.get('/site', function(req, res, next) {
    res.render('site/build/index.html')
})

server.get('/static/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/site/build/static/${req.params.filetype}/${req.params.filename}`
    res.sendFile(filename)
})

const port = process.env.PORT || 5002
http.listen(port, function() {
    console.log('Gameserver API running! Port: ' + port)
})
WebSocket.connect(http)
