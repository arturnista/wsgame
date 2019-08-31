var admin = require("firebase-admin")

var serviceAccount = require("./magearena-firebase.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nwgame-d8f9d.firebaseio.com"
})

function getDatabase() {
    return admin.firestore()
}

module.exports = {
    getDatabase,
}