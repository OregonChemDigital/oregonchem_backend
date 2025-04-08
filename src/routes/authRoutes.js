const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebaseAdmin');

router.post('/verify', async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        res.json({ uid: decodedToken.uid });
    } catch (error) {
        res.status(401).json({ 
            message: 'Unauthorized',
            error: error.message
        });
    }
});

module.exports = router;