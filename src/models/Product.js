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

const ProductSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Product name is required"],
            trim: true
        },
        presentations: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Presentation",
            required: [true, "At least one presentation is required"]
        }],
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
            site1: siteSchema,
            site2: siteSchema,
            site3: siteSchema,
            site4: siteSchema,
            site5: siteSchema
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
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
