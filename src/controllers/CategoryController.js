const Category = require("../models/Category");

const CategoryController = {
    // GET ALL CATEGORIES
    async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // ADD A CATEGORY
    async addCategory(req, res) {
        try {
            const { name } = req.body;

            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ message: "Esa categoría ya existe" });
            }

            const images = {};
            for (let i = 1; i <= 5; i++) {
                if (req.files[`site${i}`] && req.files[`site${i}`][0]) {
                    images[`site${i}`] = req.files[`site${i}`][0].downloadURL;
                }
            }

            const category = new Category({ name, images });

            await category.save();
            res.status(201).json(category);
        } catch (error) {
            console.error("Error adding category:", error);
            res
                .status(500)
                .json({ message: "Error adding category", error: error.message });
        }
    },

    // UPDATE A CATEGORY

    // DELETE A CATEGORY
};

module.exports = CategoryController;