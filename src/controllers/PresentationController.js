const Presentation = require("../models/Presentation");

const PresentationController = {
    // GET ALL PRESENTATIONS
    async getAllPresentations(req, res) {
        try {
            const presentations = await Presentation.find().select('name type measure images createdAt updatedAt');
            res.status(200).json({ data: presentations });
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching presentations", 
                error: error.message 
            });
        }
    },

    // ADD ONE PRESENTATION
    async addPresentation(req, res) {
        try {
            const { name, type, measure } = req.body;

            if (!name || !type || !measure) {
                return res.status(400).json({ 
                    message: "Name, type, and measure are required" 
                });
            }

            const images = {};
            if (req.files) {
                for (let i = 1; i <= 5; i++) {
                    const imageFile = req.files[`images[site${i}]`];
                    if (imageFile && imageFile[0]) {
                        images[`site${i}`] = imageFile[0].downloadURL;
                    }
                }
            }

            const presentation = new Presentation({
                name,
                type,
                measure,
                images,
                createdAt: new Date()
            });

            await presentation.save();
            res.status(201).json({ data: presentation });
        } catch (error) {
            res.status(500).json({ 
                message: "Error adding presentation", 
                error: error.message 
            });
        }
    },

    // UPDATE A PRESENTATION
    async updatePresentation(req, res) {
        try {
            const { id } = req.params;
            const { name, type, measure, frontends, descriptions } = req.body;

            if (!name || !type || !frontends) {
                return res.status(400).json({
                    message: "Missing required fields: name, type, frontends"
                });
            }

            const images = {};

            frontends.forEach(site => {
                const imageFile = req.files ? req.files[`images[${site}]`] : null;
                // Only update image if a new one is provided
                if (imageFile && imageFile.length > 0) {
                    images[site] = imageFile[0].downloadURL;
                }
            });

            const updateData = {
                name,
                type,
                measure,
                frontends,
                descriptions,
                ...(Object.keys(images).length > 0 && { images })
            };

            const updatedPresentation = await Presentation.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!updatedPresentation) {
                return res.status(404).json({
                    message: "Presentation not found"
                });
            }

            res.status(200).json({ 
                message: "Presentation updated successfully",
                data: updatedPresentation 
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating presentation",
                error: error.message
            });
        }
    },

    // DELETE A PRESENTATION
    async deletePresentation(req, res) {
        try {
            const { id } = req.params;
            const presentation = await Presentation.findById(id);

            if (!presentation) {
                return res.status(404).json({ 
                    message: "Presentation not found" 
                });
            }

            await Presentation.findByIdAndDelete(id);
            res.status(200).json({ 
                message: "Presentation deleted successfully" 
            });
        } catch (error) {
            res.status(500).json({ 
                message: "Error deleting presentation", 
                error: error.message 
            });
        }
    },
};

module.exports = PresentationController;