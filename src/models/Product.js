const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        presentations: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Presentation" },
        ],
        categories: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        ],
        descriptions: {
            site1: { type: String },
            site2: { type: String },
            site3: { type: String },
            site4: { type: String },
            site5: { type: String },
        },
        uses: {
            site1: { type: String },
            site2: { type: String },
            site3: { type: String },
            site4: { type: String },
            site5: { type: String },
        },
        images: {
            site1: { type: String },
            site2: { type: String },
            site3: { type: String },
            site4: { type: String },
            site5: { type: String },
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
