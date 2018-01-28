const moment = require('moment')
var http = require('http')
var fs = require('fs')

const platform = 'linux'
const serverUrl = `http://tutuonline.herokuapp.com`
const filesUrl = `${serverUrl}/gamedata/${platform}`

function downloadFile(filename) {
    const url = filesUrl + '/' + filename
    const file = fs.createWriteStream(filename)
    const request = http.get(url, function(response) {
        response.pipe(file)
    })
}

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
                body += data
            })
            res.on("end", () => {
                resolve(JSON.parse(body))
            })
        })
    })
}

get(serverUrl + '/updates')
.then(data => {
    console.log(data)
})
