const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        site: {
            type: String,
            enum: ["site1", "site2", "site3", "site4", "site5"],
            required: true,
        },
        imageUrl: { type: String, required: true },
    },
    { timestamps: true }
);

const Banner = mongoose.model("Banner", BannerSchema);

module.exports = Banner;