const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'oregonchem-pe.appspot.com',
    });
}

const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, bucket, auth };
