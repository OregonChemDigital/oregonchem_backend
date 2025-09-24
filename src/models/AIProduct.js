const mongoose = require("mongoose");

const siteSchema = {
    type: String,
    default: ""
};

const priceSchema = {
    type: Number,
    min: 0,
    default: null
};

const seoSchema = {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] }
};

const aiImageSchema = {
    url: { type: String, default: "" },
    provider: { type: String, enum: ['dalle3', 'gemini'], default: 'dalle3' },
    prompt: { type: String, default: "" },
    templateId: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
    isAIGenerated: { type: Boolean, default: false }
};

const aiSettingsSchema = {
    provider: { type: String, enum: ['dalle3', 'gemini'], default: 'dalle3' },
    prompt: { type: String, default: "" },
    style: { type: String, enum: ['realistic', 'illustration', 'minimalist', 'vintage'], default: 'realistic' },
    quality: { type: String, enum: ['standard', 'hd'], default: 'standard' },
    variations: { type: Number, min: 1, max: 4, default: 1 }
};

const AIProductSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Product name is required"],
            trim: true
        },
        // AI-specific fields
        templates: [{
            type: String,
            enum: ['bottle_1l', 'bottle_500ml', 'bottle_250ml', 'bag_1kg', 'bag_500g', 'barrel_20L', 'container_5L', 'sachet_100g'],
            required: [true, "At least one template is required"]
        }],
        format: {
            type: String,
            enum: ['LITROS', 'KILOS'],
            required: [true, "Format is required"]
        },
        presentation: {
            type: String,
            required: [true, "Presentation is required"]
        },
        aiSettings: {
            type: aiSettingsSchema,
            required: true
        },
        // Standard product fields
        categories: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Category",
            required: [true, "At least one category is required"]
        }],
        frontends: {
            type: [String],
            enum: ['site1', 'site2', 'site3', 'site4', 'site5'],
            default: ['site1'],
            required: [true, "At least one frontend must be selected"]
        },
        descriptions: {
            site1: siteSchema,
            site2: siteSchema,
            site3: siteSchema,
            site4: siteSchema,
            site5: siteSchema
        },
        uses: {
            site1: siteSchema,
            site2: siteSchema,
            site3: siteSchema,
            site4: siteSchema,
            site5: siteSchema
        },
        images: {
            site1: aiImageSchema,
            site2: aiImageSchema,
            site3: aiImageSchema,
            site4: aiImageSchema,
            site5: aiImageSchema
        },
        prices: {
            site1: priceSchema,
            site2: priceSchema,
            site3: priceSchema,
            site4: priceSchema,
            site5: priceSchema
        },
        seo: {
            site1: seoSchema,
            site2: seoSchema,
            site3: seoSchema,
            site4: seoSchema,
            site5: seoSchema
        },
        // AI Generation tracking
        aiGenerationStatus: {
            type: String,
            enum: ['pending', 'generating', 'completed', 'failed'],
            default: 'pending'
        },
        aiGenerationLog: [{
            timestamp: { type: Date, default: Date.now },
            status: { type: String, required: true },
            message: { type: String, required: true },
            provider: { type: String },
            templateId: { type: String }
        }]
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for getting template details
AIProductSchema.virtual('templateDetails').get(function() {
    const templateMap = {
        'bottle_1l': { name: 'Botella 1L', type: 'liquido' },
        'bottle_500ml': { name: 'Botella 500ml', type: 'liquido' },
        'bottle_250ml': { name: 'Botella 250ml', type: 'liquido' },
        'bag_1kg': { name: 'Bolsa 1kg', type: 'solido' },
        'bag_500g': { name: 'Bolsa 500g', type: 'solido' },
        'barrel_20L': { name: 'Barril 20L', type: 'liquido' },
        'container_5L': { name: 'Contenedor 5L', type: 'liquido' },
        'sachet_100g': { name: 'Sobre 100g', type: 'solido' }
    };
    
    return this.templates.map(templateId => ({
        id: templateId,
        ...templateMap[templateId]
    }));
});

const AIProduct = mongoose.model("AIProduct", AIProductSchema);
module.exports = AIProduct;

