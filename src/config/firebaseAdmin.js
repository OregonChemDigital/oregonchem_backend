const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firebase Admin if it hasn't been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
        scopes: [
            'https://www.googleapis.com/auth/analytics.readonly',
            'https://www.googleapis.com/auth/analytics'
        ]
    });
}

// Initialize Google Auth client with service account credentials
const googleAuth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/analytics'
    ],
});

// Google Analytics Data API client
const analyticsDataClient = google.analyticsdata('v1beta');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Apply the middleware to analytics routes
router.use(verifyToken);

// Endpoint to fetch analytics data
router.get('/analytics', async (req, res) => {
    try {
        const authClient = await googleAuth.getClient();

        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

        const [response] = await analyticsDataClient.properties.runReport({
            property: `properties/${propertyId}`,
            auth: authClient,
            requestBody: {
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
                dimensions: [{ name: 'date' }],
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ message: 'Error fetching analytics data', error: error.message });
    }
});

module.exports = {
    admin,
    auth: admin.auth(),
    googleAuth,
    analyticsDataClient,
    router,
    verifyToken
};
