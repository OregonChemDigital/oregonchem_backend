const mongoose = require("mongoose");

const siteSchema = {
    type: String,
    default: ""
};

const PresentationSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Presentation name is required"],
            unique: true,
            trim: true
        },
        type: { 
            type: String, 
            enum: {
                values: ["solido", "liquido", "polvo", "granulado"],
                message: "Invalid presentation type"
            },
            required: [true, "Presentation type is required"]
        },
        measure: { 
            type: String, 
            trim: true
        },
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

const Presentation = mongoose.model("Presentation", PresentationSchema);
module.exports = Presentation;