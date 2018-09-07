const functions = require('firebase-functions')
const admin = require('firebase-admin')
// INITIALIZATIONS
admin.initializeApp()

exports.createUser = functions.auth.user().onCreate(event => {
    return admin.auth().getUser(event.uid)
    .then(userRecord => {
        const userData = userRecord.toJSON()
        const data = {
            id: userData.uid,
            email: userData.email,
            status: {
                elo: 1000,
            },
            preferences: {
                name: userData.displayName || '',
                hotkeys: ['q', 'w', 'e'],
                spells: [],
            },
            badges: []
        }
        return admin.firestore().collection('/users').doc(data.id).set(data)
    })
})

exports.deleteUser = functions.auth.user().onDelete(event => {
    return admin.firestore().collection('/users').doc(event.uid).delete()
})