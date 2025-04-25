const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebaseAdmin');

router.post('/verify', async (req, res) => {
    console.log('Auth verification requested');
    const { idToken } = req.body;

    if (!idToken) {
        console.log('No ID token provided');
        return res.status(400).json({ 
            message: 'Missing ID token',
            error: 'No ID token provided in request body'
        });
    }

    try {
        console.log('Verifying ID token...');
        const decodedToken = await auth.verifyIdToken(idToken);
        console.log('Token verified successfully for user:', decodedToken.uid);
        res.json({ uid: decodedToken.uid });
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ 
            message: 'Unauthorized',
            error: error.message
        });
    }
});

module.exports = router;