const Product = require("../models/Product");

const ProductController = {
    // GET ALL PRODUCTS
    async getAllProducts(req, res) {
        try {
            const { site } = req.query;
            const products = await Product.find()
                .select('name presentations categories descriptions uses images createdAt updatedAt')
                .populate({
                    path: 'presentations',
                    select: 'name type measure'
                })
                .populate({
                    path: 'categories',
                    select: 'name'
                })
                .exec();

            console.log('Raw products from database:', products.map(p => ({
                _id: p._id,
                name: p.name,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            })));

            const filteredProducts = products.map((product) => {
                // If no site is specified, return all data
                if (!site) {
                    return {
                        _id: product._id,
                        name: product.name,
                        presentations: product.presentations || [],
                        categories: product.categories || [],
                        descriptions: product.descriptions || {},
                        uses: product.uses || {},
                        images: product.images || {},
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt
                    };
                }

                // If site is specified, return site-specific data
                const siteSpecificData = {
                    descriptions: product.descriptions?.[site] || product.descriptions?.site1 || "",
                    uses: product.uses?.[site] || product.uses?.site1 || "",
                    images: product.images?.[site] || product.images?.site1 || ""
                };

                return {
                    _id: product._id,
                    name: product.name,
                    presentations: product.presentations || [],
                    categories: product.categories || [],
                    descriptions: siteSpecificData.descriptions,
                    uses: siteSpecificData.uses,
                    images: siteSpecificData.images,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                };
            });

            console.log('Filtered products being sent:', filteredProducts.map(p => ({
                _id: p._id,
                name: p.name,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            })));

            res.status(200).json({ data: filteredProducts });
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            res.status(500).json({
                message: "Error fetching products",
                error: error.message
            });
        }
    },


    // ADD A PRODUCT
    async createProduct(req, res) {
        try {
            const { name, presentations, categories, descriptions, uses } = req.body;

            if (!name || !presentations || !categories) {
                return res.status(400).json({
                    message: "Missing required fields: name, presentations, categories"
                });
            }

            const images = {};
            ["site1", "site2", "site3", "site4", "site5"].forEach((site, index) => {
                const imageFile = req.files ? req.files[`images[site${index + 1}]`] : null;
                images[site] = imageFile && imageFile.length > 0 ? imageFile[0].downloadURL : "";
            });

            const newProduct = new Product({
                name,
                presentations,
                categories,
                descriptions,
                uses,
                images,
            });

            const savedProduct = await newProduct.save();
            res.status(201).json({ data: savedProduct });
        } catch (error) {
            res.status(500).json({
                message: "Error creating product",
                error: error.message
            });
        }
    },

    async getProductByIdAndSite(req, res) {
        const { id, site } = req.params;
        try {
            const product = await Product.findById(id)
                .populate("presentations categories")
                .exec();

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            const siteData = {
                descriptions: product.descriptions[site],
                uses: product.uses[site],
                images: product.images[site]
            };

            if (!siteData.descriptions && !siteData.uses && !siteData.images) {
                return res.status(404).json({
                    message: "No data available for the requested site"
                });
            }

            res.status(200).json({
                name: product.name,
                presentations: product.presentations,
                categories: product.categories,
                descriptions: siteData.descriptions,
                uses: siteData.uses,
                images: siteData.images,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching product",
                error: error.message
            });
        }
    },

    // SEARCH PRODUCTS BY NAME
    async searchProducts(req, res) {
        try {
            const { searchTerm } = req.query;
            if (!searchTerm) {
                return res.status(400).json({
                    message: "Search term is required"
                });
            }

            const products = await Product.find({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            }).populate('categories');

            res.status(200).json({ data: products });
        } catch (error) {
            res.status(500).json({
                message: "Error searching products",
                error: error.message
            });
        }
    },

    // UPDATE A PRODUCT
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, presentations, categories, descriptions, uses } = req.body;

            if (!name || !presentations || !categories) {
                return res.status(400).json({
                    message: "Missing required fields: name, presentations, categories"
                });
            }

            const images = {};
            ["site1", "site2", "site3", "site4", "site5"].forEach((site, index) => {
                const imageFile = req.files ? req.files[`images[site${index + 1}]`] : null;
                if (imageFile && imageFile.length > 0) {
                    images[site] = imageFile[0].downloadURL;
                }
            });

            const updateData = {
                name,
                presentations,
                categories,
                descriptions,
                uses,
                ...(Object.keys(images).length > 0 && { images })
            };

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).populate('presentations categories');

            if (!updatedProduct) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.status(200).json({ 
                message: "Product updated successfully",
                data: updatedProduct 
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating product",
                error: error.message
            });
        }
    }
};

module.exports = ProductController;

