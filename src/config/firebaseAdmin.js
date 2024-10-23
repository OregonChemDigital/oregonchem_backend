const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, '../utils/serviceAccountKey.json'), 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'oregonchem-pe.appspot.com',
    });
}

const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, bucket, auth };