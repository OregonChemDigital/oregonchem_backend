const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Banner name is required"],
            trim: true
        },
        site: {
            type: String,
            enum: {
                values: ["site1", "site2", "site3", "site4", "site5"],
                message: "Invalid site value"
            },
            required: [true, "Site is required"]
        },
        imageUrl: { 
            type: String, 
            required: [true, "Image URL is required"]
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Banner = mongoose.model("Banner", BannerSchema);

module.exports = Banner;