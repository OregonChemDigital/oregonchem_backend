const Product = require("../models/Product");

const ProductController = {
    // GET ALL PRODUCTS
    async getAllProducts(req, res) {
        try {
            const { site } = req.query;
            const products = await Product.find()
                .select('name presentations categories frontends descriptions uses images seo createdAt updatedAt')
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
                frontends: p.frontends,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            })));

            const filteredProducts = products.map((product) => {
                // If no site is specified, return all data
                if (!site) {
                    return {
                        _id: product._id,
                        name: product.name,
                        frontends: product.frontends || [],
                        presentations: product.presentations || [],
                        categories: product.categories || [],
                        descriptions: product.descriptions || {},
                        uses: product.uses || {},
                        images: product.images || {},
                        seo: product.seo || {},
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt
                    };
                }

                // If site is specified, only return data if the product is available for that site
                if (!product.frontends.includes(site)) {
                    return null;
                }

                const siteSpecificData = {
                    descriptions: product.descriptions?.[site] || "",
                    uses: product.uses?.[site] || "",
                    images: product.images?.[site] || "",
                    seo: product.seo?.[site] || {}
                };

                return {
                    _id: product._id,
                    name: product.name,
                    frontends: product.frontends,
                    presentations: product.presentations || [],
                    categories: product.categories || [],
                    descriptions: siteSpecificData.descriptions,
                    uses: siteSpecificData.uses,
                    images: siteSpecificData.images,
                    seo: siteSpecificData.seo,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                };
            }).filter(Boolean); // Remove null entries

            console.log('Filtered products being sent:', filteredProducts.map(p => ({
                _id: p._id,
                name: p.name,
                frontends: p.frontends,
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
            const { name, presentations, categories, frontends, descriptions, uses } = req.body;

            if (!name || !presentations || !categories || !frontends) {
                return res.status(400).json({
                    message: "Missing required fields: name, presentations, categories, frontends"
                });
            }

            const images = {};
            const seo = {};

            frontends.forEach(site => {
                const imageFile = req.files ? req.files[`images[${site}]`] : null;
                images[site] = imageFile && imageFile.length > 0 ? imageFile[0].downloadURL : "";

                // Process SEO data
                const siteUses = uses[site] || "";
                const keywords = siteUses.split(',').map(k => k.trim()).filter(k => k);
                
                seo[site] = {
                    title: name,
                    description: descriptions[site] || "",
                    keywords: keywords
                };
            });

            const newProduct = new Product({
                name,
                presentations,
                categories,
                frontends,
                descriptions,
                uses,
                images,
                seo
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

            if (!product.frontends.includes(site)) {
                return res.status(404).json({
                    message: "Product not available for the requested site"
                });
            }

            const siteData = {
                descriptions: product.descriptions[site],
                uses: product.uses[site],
                images: product.images[site],
                seo: product.seo[site]
            };

            if (!siteData.descriptions && !siteData.uses && !siteData.images) {
                return res.status(404).json({
                    message: "No data available for the requested site"
                });
            }

            res.status(200).json({
                name: product.name,
                frontends: product.frontends,
                presentations: product.presentations,
                categories: product.categories,
                descriptions: siteData.descriptions,
                uses: siteData.uses,
                images: siteData.images,
                seo: siteData.seo
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
            const { searchTerm, site } = req.query;
            if (!searchTerm) {
                return res.status(400).json({
                    message: "Search term is required"
                });
            }

            const query = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { 'seo.keywords': { $in: [new RegExp(searchTerm, 'i')] } }
                ]
            };

            if (site) {
                query.frontends = site;
            }

            const products = await Product.find(query).populate('categories');

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
            const { name, presentations, categories, frontends, descriptions, uses } = req.body;

            if (!name || !presentations || !categories || !frontends) {
                return res.status(400).json({
                    message: "Missing required fields: name, presentations, categories, frontends"
                });
            }

            const images = {};
            const seo = {};

            frontends.forEach(site => {
                const imageFile = req.files ? req.files[`images[${site}]`] : null;
                if (imageFile && imageFile.length > 0) {
                    images[site] = imageFile[0].downloadURL;
                }

                // Process SEO data
                const siteUses = uses[site] || "";
                const keywords = siteUses.split(',').map(k => k.trim()).filter(k => k);
                
                seo[site] = {
                    title: name,
                    description: descriptions[site] || "",
                    keywords: keywords
                };
            });

            const updateData = {
                name,
                presentations,
                categories,
                frontends,
                descriptions,
                uses,
                seo,
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

