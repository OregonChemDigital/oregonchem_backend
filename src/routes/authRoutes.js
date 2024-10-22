const express = require('express');
const router = express.Router();

router.post('/verify', async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        res.json({ uid: decodedToken.uid });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

module.exports = router;