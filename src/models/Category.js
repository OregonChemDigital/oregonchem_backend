const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
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

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;