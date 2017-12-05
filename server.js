const restify = require('restify')
const moment = require('moment')
const fs = require('fs')

const WebSocket = require('./src/WebSocket')

const packageJson = require('./package.json')

const server = restify.createServer()

restify.CORS.ALLOW_HEADERS.push('Accept-Encoding')
restify.CORS.ALLOW_HEADERS.push('Accept-Language')
restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin')
restify.CORS.ALLOW_HEADERS.push('origin')
restify.CORS.ALLOW_HEADERS.push('authorization')

server.pre(restify.CORS({ credentials: true }))
server.use(restify.queryParser())
server.use(restify.jsonBodyParser())

server.get('/', function(req, res, next) {
    const now = moment()
    res.json(200, {
        name: 'Gameserver',
        version: packageJson.version,
        status: 200,
        now: now.toISOString(),
        unix_now: now.unix()
    })
})

server.get('/site', function(req, res, next) {
    fs.readFile(__dirname + '/../site/build/index.html', 'UTF-8', (err, data) => {
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(data),
            'Content-Type': 'text/html'
        })
        res.write(data)
        res.end()
    })
})
server.get('/static/:filetype/:filename', function(req, res, next) {
    const filename = `${__dirname}/../site/build/static/${req.params.filetype}/${req.params.filename}`
    fs.readFile(filename, 'UTF-8', (err, data) => {
        if(err) return res.json(500)

        res.writeHead(200, { 'Content-Length': Buffer.byteLength(data) })
        res.write(data)
        res.end()
    })
})

const port = process.env.PORT || 5002
server.listen(port, function() {
    console.log('Gameserver API running! Port: ' + port)
})
WebSocket.connect(server.server)
