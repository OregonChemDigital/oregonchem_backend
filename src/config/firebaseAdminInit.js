const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Main service account
const analyticsServiceAccount = require('./analyticsServiceAccountKey.json'); // Analytics service account

let mainApp;
let analyticsApp;

if (!admin.apps.length) {
    // Main app init
    mainApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    }, 'main');

    // Analytics app init
    analyticsApp = admin.initializeApp({
        credential: admin.credential.cert(analyticsServiceAccount),
    }, 'analytics');
} else {
    mainApp = admin.app('main');
    analyticsApp = admin.app('analytics');
}

module.exports = {
    admin,
    mainApp,
    analyticsApp,
};

