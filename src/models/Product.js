const mongoose = require("mongoose");

const siteSchema = {
    type: String,
    default: ""
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
