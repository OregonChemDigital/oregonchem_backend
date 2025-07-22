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

    // DELETE A BANNER
    async deleteBanner(req, res) {
        try {
            const { id } = req.params;
            const banner = await Banner.findById(id);

            if (!banner) {
                return res.status(404).json({ 
                    message: "Banner not found" 
                });
            }

            await Banner.findByIdAndDelete(id);
            res.status(200).json({ 
                message: "Banner deleted successfully" 
            });
        } catch (error) {
            res.status(500).json({ 
                message: "Error deleting banner", 
                error: error.message 
            });
        }
    },
};

module.exports = BannerController;