const admin = require("firebase-admin")

let serviceAccount = {}
if(process.env.FIREBASE === 'true') {
    serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY : JSON.parse(process.env.FIREBASE_PRIVATE_KEY_RAW),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }
} else {
    serviceAccount = require("./magearena-firebase.json")
}

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