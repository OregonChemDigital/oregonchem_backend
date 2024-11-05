const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'oregonchem-pe.appspot.com',
    });
}

const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, bucket, auth };
