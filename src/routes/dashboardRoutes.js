const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const Quote = require('../models/Quote');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Quote.aggregate([
            {
                $group: {
                    _id: '$site.id',
                    totalQuotes: { $sum: 1 },
                    pendingQuotes: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approvedQuotes: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejectedQuotes: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    completedQuotes: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
});

// Get recent quotes
router.get('/recent-quotes', auth, async (req, res) => {
    try {
        const quotes = await Quote.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('site', 'name');

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching recent quotes:', error);
        res.status(500).json({ error: 'Error fetching recent quotes' });
    }
});

// Get quotes by status
router.get('/quotes-by-status', auth, async (req, res) => {
    try {
        const quotes = await Quote.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes by status:', error);
        res.status(500).json({ error: 'Error fetching quotes by status' });
    }
});

// Get quotes by site
router.get('/quotes-by-site', auth, async (req, res) => {
    try {
        const quotes = await Quote.aggregate([
            {
                $group: {
                    _id: '$site.id',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(quotes);
    } catch (error) {
        console.error('Error fetching quotes by site:', error);
        res.status(500).json({ error: 'Error fetching quotes by site' });
    }
});

module.exports = router; 