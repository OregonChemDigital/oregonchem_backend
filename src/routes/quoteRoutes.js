const express = require('express');
const router = express.Router();
const QuoteController = require('../controllers/QuoteController');
const dashboardController = require('../controllers/dashboardController');
const { validateSite } = require('../middlewares/siteValidation');

// Public routes
router.post('/public/quotes', QuoteController.createQuote);
router.get('/public/quotes/:id', QuoteController.getQuote);

// Dashboard routes
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/recent-quotes', dashboardController.getRecentQuotes);
router.get('/dashboard/quotes-by-status', dashboardController.getQuotesByStatus);
router.get('/dashboard/quotes-by-site', dashboardController.getQuotesBySite);
router.get('/dashboard/quotes/:id', dashboardController.getQuoteDetails);
router.put('/dashboard/quotes/:id/status', dashboardController.updateQuoteStatus);

// Create a new quote
router.post('/', validateSite, QuoteController.createQuote);

// Get quotes with filtering
router.get('/', QuoteController.getQuotes);

// Get a specific quote
router.get('/:id', QuoteController.getQuote);

// Update quote status
router.patch('/:id/status', QuoteController.updateQuoteStatus);

module.exports = router; 