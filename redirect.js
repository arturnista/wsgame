const express = require('express')
const cors = require('cors')
const server = express()
const http = require('http').Server(server)

server.use(cors())

server.use(function forceLiveDomain(req, res, next) {
    return res.redirect(301, 'https://magearena.com/')
    return next()
})

const port = 2000
http.listen(port, function() {
    console.log('Redirect server running at ' + port)
})
