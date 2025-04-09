const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    site: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        department: {
            type: String,
            trim: true
        }
    },
    client: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            trim: true
        },
        ruc: {
            type: String,
            trim: true
        }
    },
    products: [{
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            required: true,
            enum: ['kg', 'l', 'unidad', 'unidades']
        },
        presentation: {
            type: String,
            default: '-'
        },
        frequency: {
            type: String,
            default: '-'
        }
    }],
    observations: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        language: String
    },
    contactMethod: {
        type: String,
        enum: ['email', 'whatsapp', 'llamada'],
        default: 'email'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
quoteSchema.index({ 'client.email': 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
quoteSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
