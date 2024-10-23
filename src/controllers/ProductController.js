const Product = require("../models/Product");

const ProductController = {
    // GET ALL PRODUCTS
    async getAllProducts(req, res) {
        try {
            const { site } = req.query;
            const products = await Product.find()
                .populate("presentations categories")
                .exec();
            console.log('Products fetched:', products);
            const filteredProducts = products.map((product) => {
                let siteSpecificData = {
                    descriptions: product.descriptions[site],
                    uses: product.uses[site],
                    images: product.images[site]
                };
                if (site) {
                    const specificSiteData = product.descriptions[site] ? siteSpecificData : {};
                }
                return {
                    name: product.name,
                    presentations: product.presentations,
                    categories: product.categories,
                    descriptions: specificSiteData.descriptions,
                    uses: specificSiteData.uses,
                    images: specificSiteData.images
                };
            });
            res.status(200).json(filteredProducts);
        } catch (error) {
            res.status(500).json({ message: "Error fetching products", error });
        }
    },

    // ADD A PRODUCT
    async createProduct(req, res) {
        try {
            const { name, presentations, categories, descriptions, uses } = req.body;
            const images = {};
            ["site1", "site2", "site3", "site4", "site5"].forEach((site, index) => {
                const imageFile = req.files[`site${index + 1}`];
                if (imageFile && imageFile.length > 0) {
                    images[site] = imageFile[0].downloadURL;
                }
            });

            const newProduct = new Product({
                name,
                presentations: JSON.parse(presentations),
                categories: JSON.parse(categories),
                descriptions,
                uses,
                images
            });

            const savedProduct = await newProduct.save();
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Error creating product", error });
        }
    },

    // SEARCH PRODUCTS BY NAME
    async searchProducts(req, res) {
        try {
            const searchTerm = req.query.searchTerm;
            const products = await Product.find({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            }).populate('categories');
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error searching products', error });
        }
    }
};

module.exports = ProductController;
