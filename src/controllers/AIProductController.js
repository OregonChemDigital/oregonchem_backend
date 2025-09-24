const AIProduct = require("../models/AIProduct");

const AIProductController = {
    // GET ALL AI PRODUCTS
    async getAllAIProducts(req, res) {
        try {
            const { site } = req.query;
            const products = await AIProduct.find()
                .select('name templates format presentation categories frontends descriptions uses images seo aiSettings aiGenerationStatus createdAt updatedAt')
                .populate({
                    path: 'categories',
                    select: 'name'
                })
                .exec();

            console.log('Raw AI products from database:', products.map(p => ({
                _id: p._id,
                name: p.name,
                templates: p.templates,
                frontends: p.frontends,
                aiGenerationStatus: p.aiGenerationStatus,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            })));

            // First filter products by site if site parameter is provided
            const siteFilteredProducts = site 
                ? products.filter(product => product.frontends.includes(site))
                : products;

            const filteredProducts = siteFilteredProducts.map((product) => {
                // If no site is specified, return all data
                if (!site) {
                    return {
                        _id: product._id,
                        name: product.name,
                        templates: product.templates,
                        format: product.format,
                        presentation: product.presentation,
                        frontends: product.frontends || [],
                        categories: product.categories || [],
                        descriptions: product.descriptions || {},
                        uses: product.uses || {},
                        images: product.images || {},
                        prices: product.prices || {},
                        seo: product.seo || {},
                        aiSettings: product.aiSettings || {},
                        aiGenerationStatus: product.aiGenerationStatus,
                        templateDetails: product.templateDetails,
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt
                    };
                }

                const siteSpecificData = {
                    descriptions: product.descriptions?.[site] || "",
                    uses: product.uses?.[site] || "",
                    images: product.images?.[site] || {},
                    seo: product.seo?.[site] || {}
                };

                return {
                    _id: product._id,
                    name: product.name,
                    templates: product.templates,
                    format: product.format,
                    presentation: product.presentation,
                    frontends: product.frontends,
                    categories: product.categories || [],
                    descriptions: siteSpecificData.descriptions,
                    uses: siteSpecificData.uses,
                    images: siteSpecificData.images,
                    seo: siteSpecificData.seo,
                    aiSettings: product.aiSettings || {},
                    aiGenerationStatus: product.aiGenerationStatus,
                    templateDetails: product.templateDetails,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                };
            });

            console.log('Filtered AI products being sent:', filteredProducts.map(p => ({
                _id: p._id,
                name: p.name,
                templates: p.templates,
                frontends: p.frontends,
                aiGenerationStatus: p.aiGenerationStatus,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            })));

            res.status(200).json({ data: filteredProducts });
        } catch (error) {
            console.error('Error in getAllAIProducts:', error);
            res.status(500).json({
                message: "Error fetching AI products",
                error: error.message
            });
        }
    },

    // CREATE AI PRODUCT
    async createAIProduct(req, res) {
        try {
            const { 
                name, 
                templates, 
                format, 
                presentation, 
                categories, 
                frontends, 
                descriptions, 
                uses, 
                prices, 
                aiSettings 
            } = req.body;

            console.log('AI Product creation request:', {
                name,
                templates,
                format,
                presentation,
                categories,
                frontends,
                aiSettings
            });

            if (!name || !templates || !format || !presentation || !categories || !frontends) {
                return res.status(400).json({
                    message: "Missing required fields: name, templates, format, presentation, categories, frontends"
                });
            }

            const images = {};
            const seo = {};

            // Initialize images and SEO for each frontend
            frontends.forEach(site => {
                const imageFile = req.files ? req.files[`images[${site}]`] : null;
                
                // Set up AI image structure
                images[site] = {
                    url: imageFile && imageFile.length > 0 ? imageFile[0].downloadURL : "",
                    provider: aiSettings?.provider || 'dalle3',
                    prompt: aiSettings?.prompt || "",
                    templateId: templates[0] || "", // Use first template as default
                    generatedAt: new Date(),
                    isAIGenerated: false // Will be updated when AI generation completes
                };

                // Process SEO data
                const siteUses = uses[site] || "";
                const keywords = siteUses.split(',').map(k => k.trim()).filter(k => k);
                
                seo[site] = {
                    title: name,
                    description: descriptions[site] || "",
                    keywords: keywords
                };
            });

            const newAIProduct = new AIProduct({
                name,
                templates,
                format,
                presentation,
                categories,
                frontends,
                descriptions,
                uses,
                images,
                prices,
                seo,
                aiSettings: aiSettings || {
                    provider: 'dalle3',
                    prompt: '',
                    style: 'realistic',
                    quality: 'standard',
                    variations: 1
                },
                aiGenerationStatus: 'pending'
            });

            const savedProduct = await newAIProduct.save();
            
            // Log the creation
            savedProduct.aiGenerationLog.push({
                status: 'created',
                message: 'AI product created successfully',
                provider: aiSettings?.provider || 'dalle3'
            });
            await savedProduct.save();

            console.log('AI Product created successfully:', {
                id: savedProduct._id,
                name: savedProduct.name,
                templates: savedProduct.templates,
                aiGenerationStatus: savedProduct.aiGenerationStatus
            });

            res.status(201).json({ 
                data: savedProduct,
                message: "AI product created successfully. AI generation can now be triggered."
            });
        } catch (error) {
            console.error('Error creating AI product:', error);
            res.status(500).json({
                message: "Error creating AI product",
                error: error.message
            });
        }
    },

    // TRIGGER AI IMAGE GENERATION
    async triggerAIGeneration(req, res) {
        try {
            const { id } = req.params;
            const { webhookUrl, provider } = req.body;

            const product = await AIProduct.findById(id);
            if (!product) {
                return res.status(404).json({ message: "AI product not found" });
            }

            // Update status to generating
            product.aiGenerationStatus = 'generating';
            product.aiGenerationLog.push({
                status: 'generating',
                message: 'AI image generation started',
                provider: provider || product.aiSettings.provider
            });
            await product.save();

            // TODO: Here you would trigger the actual AI generation via webhook
            // This is where your team member will implement the Make.com integration
            console.log('Triggering AI generation for product:', {
                id: product._id,
                name: product.name,
                templates: product.templates,
                webhookUrl,
                provider
            });

            // Simulate webhook call (replace with actual implementation)
            if (webhookUrl) {
                try {
                    const webhookPayload = {
                        productId: product._id,
                        productName: product.name,
                        templates: product.templates,
                        format: product.format,
                        presentation: product.presentation,
                        aiSettings: product.aiSettings,
                        frontends: product.frontends,
                        descriptions: product.descriptions,
                        uses: product.uses
                    };

                    console.log('Webhook payload:', webhookPayload);
                    
                    // TODO: Implement actual webhook call
                    // const webhookResponse = await fetch(webhookUrl, {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify(webhookPayload)
                    // });

                    res.status(200).json({
                        message: "AI generation triggered successfully",
                        productId: product._id,
                        status: 'generating'
                    });
                } catch (webhookError) {
                    console.error('Webhook error:', webhookError);
                    product.aiGenerationStatus = 'failed';
                    product.aiGenerationLog.push({
                        status: 'failed',
                        message: 'Webhook call failed',
                        provider: provider || product.aiSettings.provider
                    });
                    await product.save();

                    res.status(500).json({
                        message: "Failed to trigger AI generation",
                        error: webhookError.message
                    });
                }
            } else {
                res.status(400).json({
                    message: "Webhook URL is required for AI generation"
                });
            }
        } catch (error) {
            console.error('Error triggering AI generation:', error);
            res.status(500).json({
                message: "Error triggering AI generation",
                error: error.message
            });
        }
    },

    // UPDATE AI GENERATION STATUS (called by webhook)
    async updateAIStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, images, error } = req.body;

            const product = await AIProduct.findById(id);
            if (!product) {
                return res.status(404).json({ message: "AI product not found" });
            }

            product.aiGenerationStatus = status;
            
            if (images) {
                // Update images with AI-generated URLs
                Object.entries(images).forEach(([site, imageData]) => {
                    if (product.images[site]) {
                        product.images[site] = {
                            ...product.images[site],
                            url: imageData.url,
                            isAIGenerated: true,
                            generatedAt: new Date()
                        };
                    }
                });
            }

            product.aiGenerationLog.push({
                status: status,
                message: error || 'AI generation completed',
                provider: product.aiSettings.provider
            });

            await product.save();

            res.status(200).json({
                message: "AI generation status updated successfully",
                productId: product._id,
                status: product.aiGenerationStatus
            });
        } catch (error) {
            console.error('Error updating AI status:', error);
            res.status(500).json({
                message: "Error updating AI status",
                error: error.message
            });
        }
    },

    // GET AI PRODUCT BY ID
    async getAIProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await AIProduct.findById(id)
                .populate('categories')
                .exec();

            if (!product) {
                return res.status(404).json({ message: "AI product not found" });
            }

            res.status(200).json({ data: product });
        } catch (error) {
            console.error('Error fetching AI product:', error);
            res.status(500).json({
                message: "Error fetching AI product",
                error: error.message
            });
        }
    },

    // UPDATE AI PRODUCT
    async updateAIProduct(req, res) {
        try {
            const { id } = req.params;
            const { 
                name, 
                templates, 
                format, 
                presentation, 
                categories, 
                frontends, 
                descriptions, 
                uses, 
                prices, 
                aiSettings 
            } = req.body;

            console.log('AI Product update request:', {
                id,
                name,
                templates,
                format,
                presentation,
                categories,
                frontends,
                aiSettings
            });

            if (!name || !templates || !format || !presentation || !categories || !frontends) {
                return res.status(400).json({
                    message: "Missing required fields: name, templates, format, presentation, categories, frontends"
                });
            }

            // Get the existing product to preserve data
            const existingProduct = await AIProduct.findById(id);
            if (!existingProduct) {
                return res.status(404).json({
                    message: "AI product not found"
                });
            }

            const images = { ...existingProduct.images }; // Preserve existing images
            const seo = {};

            // Update images if new ones are provided
            frontends.forEach(site => {
                const imageFile = req.files ? req.files[`images[${site}]`] : null;
                if (imageFile && imageFile.length > 0) {
                    images[site] = {
                        ...images[site],
                        url: imageFile[0].downloadURL,
                        isAIGenerated: false, // Manual upload, not AI generated
                        generatedAt: new Date()
                    };
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
                templates,
                format,
                presentation,
                categories,
                frontends,
                descriptions,
                uses,
                prices,
                seo,
                images,
                aiSettings: aiSettings || existingProduct.aiSettings
            };

            const updatedProduct = await AIProduct.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).populate('categories');

            // Log the update
            updatedProduct.aiGenerationLog.push({
                status: 'updated',
                message: 'AI product updated successfully'
            });
            await updatedProduct.save();

            res.status(200).json({ 
                message: "AI product updated successfully",
                data: updatedProduct 
            });
        } catch (error) {
            console.error('Error updating AI product:', error);
            res.status(500).json({
                message: "Error updating AI product",
                error: error.message
            });
        }
    },

    // DELETE AI PRODUCT
    async deleteAIProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await AIProduct.findById(id);

            if (!product) {
                return res.status(404).json({ 
                    message: "AI product not found" 
                });
            }

            await AIProduct.findByIdAndDelete(id);
            res.status(200).json({ 
                message: "AI product deleted successfully" 
            });
        } catch (error) {
            res.status(500).json({ 
                message: "Error deleting AI product", 
                error: error.message 
            });
        }
    }
};

module.exports = AIProductController;

