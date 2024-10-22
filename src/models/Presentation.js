const mongoose = require("mongoose");

const PresentationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        type: { type: String, enum: ["solido", "liquido"], required: true },
        measure: { type: String, required: true },
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

const Presentation = mongoose.model("Presentation", PresentationSchema);
module.exports = Presentation;