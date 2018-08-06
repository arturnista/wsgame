const express = require('express')
const cors = require('cors')
const server = express()
const http = require('http').Server(server)

var corsOptionsDelegate = function (req, callback) {
    callback(null, {})
    // const corsOptions = { origin: whitelist.indexOf(req.header('Origin')) !== -1 }
    // callback(null, corsOptions)
}
server.use(cors(corsOptionsDelegate))

server.use(function forceLiveDomain(req, res, next) {
    var host = req.get('Host')
    if (host === 'nwgame.herokuapp.com') {
        return res.redirect(301, 'http://18.231.33.111/')
    }
    return next()
})

const port = process.env.PORT || 5002
http.listen(port, function() {
    console.log('Gameserver API running! Port: ' + port)
})
