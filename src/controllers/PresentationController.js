const Presentation = require("../models/Presentation");

const PresentationController = {
    // GET ALL PRESENTATIONS
    async getAllPresentations(req, res) {
        try {
            const presentations = await Presentation.find();
            res.json(presentations);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching presentations" });
        }
    },

    // ADD ONE PRESENTATION
    async addPresentation(req, res) {
        try {
            const { name, type, measure } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Name (quantity) is required" });
            }

            const images = {};
            for (let i = 1; i <= 5; i++) {
                if (req.files[`site${i}`] && req.files[`site${i}`][0]) {
                    images[`site${i}`] = req.files[`site${i}`][0].downloadURL;
                }
            }

            const presentation = new Presentation({
                name,
                type,
                measure,
                images,
            });

            await presentation.save();
            res.status(201).json(presentation);
        } catch (error) {
            console.error("Error adding presentation:", error);
            res
                .status(500)
                .json({ message: "Error adding presentation", error: error.message });
        }
    },

    // DELETE A PRESENTATION
    async deletePresentation(req, res) {
        try {
            const { id } = req.params;
            const presentation = await Presentation.findById(id);
            if (!presentation) {
                return res.status(404).json({ message: "Presentation not found" });
            }
            await Presentation.findByIdAndDelete(id);
            res.json({ message: "Presentation deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error deleting presentation" });
        }
    },
};

module.exports = PresentationController;