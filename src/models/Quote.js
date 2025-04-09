const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    site: {
        id: {
            type: String,
            required: true,
            trim: true,
            enum: ['quimicaindustrialpe', 'site2', 'site3', 'site4', 'site5']
        },
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
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
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
        lastname: {
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
            required: true
        },
        frequency: {
            type: String,
            required: true,
            enum: ['única', 'quincenal', 'mensual', 'bimestral', 'trimestral']
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
        required: true,
        enum: ['email', 'whatsapp', 'llamada']
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
