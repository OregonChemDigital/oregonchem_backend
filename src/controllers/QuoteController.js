const Quote = require('../models/Quote');
const { sendQuoteEmail } = require('../services/emailService');
const { generatePDF } = require('../services/pdfService');

const QuoteController = {
  // Create a new quote
  async createQuote(req, res) {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      if (!req.body.client?.name) {
        console.error('Missing client name in request:', req.body);
        throw new Error('Client name is required');
      }
      
      if (!req.body.site?.id) {
        console.error('Missing site ID in request:', req.body);
        throw new Error('Site ID is required');
      }

      const quote = new Quote({
        ...req.body,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          language: req.get('accept-language')
        }
      });
      
      console.log('Quote object before save:', JSON.stringify(quote, null, 2));
      
      await quote.save();
      console.log('Quote saved successfully');

      // Generate PDF
      const pdfBuffer = await generatePDF(quote);
      console.log('PDF generated successfully');

      // Send emails
      await sendQuoteEmail(quote, pdfBuffer);
      console.log('Emails sent successfully');

      res.status(201).json(quote);
    } catch (error) {
      console.error('Error creating quote:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Error creating quote', error: error.message });
    }
  },

  // Get all quotes (admin only)
  async getQuotes(req, res) {
    try {
      const quotes = await Quote.find().sort({ createdAt: -1 });
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ message: 'Error fetching quotes', error: error.message });
    }
  },

  // Get a single quote by ID
  async getQuote(req, res) {
    try {
      const quote = await Quote.findById(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }
      res.json(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ message: 'Error fetching quote', error: error.message });
    }
  },

  // Update quote status (admin only)
  async updateQuoteStatus(req, res) {
    try {
      const { status } = req.body;
      if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const quote = await Quote.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }

      res.json(quote);
    } catch (error) {
      console.error('Error updating quote status:', error);
      res.status(500).json({ message: 'Error updating quote status', error: error.message });
    }
  }
};

module.exports = QuoteController;
