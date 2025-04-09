const Quote = require('../models/Quote');

exports.getDashboardStats = async (req, res) => {
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
};

exports.getRecentQuotes = async (req, res) => {
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
};

exports.getQuotesByStatus = async (req, res) => {
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
};

exports.getQuotesBySite = async (req, res) => {
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
};

exports.getQuoteDetails = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id)
            .populate('site', 'name');

        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error fetching quote details:', error);
        res.status(500).json({ error: 'Error fetching quote details' });
    }
};

exports.updateQuoteStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const quote = await Quote.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        quote.status = status;
        await quote.save();

        res.json(quote);
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(500).json({ error: 'Error updating quote status' });
    }
}; 