const admin = require('firebase-admin');
const serviceAccount = require('../utils/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, bucket, auth };
