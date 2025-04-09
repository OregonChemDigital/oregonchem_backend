const Presentation = require("../models/Presentation");

const PresentationController = {
    // GET ALL PRESENTATIONS
    async getAllPresentations(req, res) {
        try {
            const presentations = await Presentation.find().select('name type measure images');
            console.log('Found presentations:', presentations.length); // Debug log
            res.status(200).json({ data: presentations });
        } catch (error) {
            console.error('Error in getAllPresentations:', error); // Debug log
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
            for (let i = 1; i <= 5; i++) {
                const imageFile = req.files[`images[site${i}]`];
                if (imageFile && imageFile[0]) {
                    images[`site${i}`] = imageFile[0].downloadURL;
                }
            }

            const presentation = new Presentation({
                name,
                type,
                measure,
                images,
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