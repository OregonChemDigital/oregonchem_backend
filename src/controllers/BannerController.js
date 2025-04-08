const Banner = require("../models/Banner");

const BannerController = {
    // GET ALL BANNERS
    async getAllBanners(req, res) {
        try {
            const banners = await Banner.find();
            res.status(200).json({ data: banners });
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching banners", 
                error: error.message 
            });
        }
    },

    // GET ALL BANNERS FROM ONE SITE
    async getAllBannersFromSite(req, res) {
        try {
            const { site } = req.query;
            const query = site ? { site } : {};
            const banners = await Banner.find(query);
            res.status(200).json({ data: banners });
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching banners", 
                error: error.message 
            });
        }
    },

    // ADD A BANNER
    async addBanner(req, res) {
        try {
            const { name, site } = req.body;
            const imageFile = req.file;

            if (!imageFile) {
                return res.status(400).json({ 
                    message: "Image is required" 
                });
            }

            const newBanner = new Banner({ 
                name, 
                site, 
                imageUrl: imageFile.downloadURL 
            });

            await newBanner.save();
            res.status(201).json({ data: newBanner });
        } catch (error) {
            res.status(500).json({ 
                message: "Error creating banner", 
                error: error.message 
            });
        }
    },
};

module.exports = BannerController;