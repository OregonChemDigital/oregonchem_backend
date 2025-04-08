const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    clientInfo: {
        name: String,
        lastName: String,
        dni: String,
        phone: String,
        email: String,
        company: String,
        socialReason: String,
        ruc: String,
    },
    contactMethod: String,
    observations: String,
    selectedProducts: [{
        name: String,
        volume: String,
        presentation: String
    }],
    date: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
