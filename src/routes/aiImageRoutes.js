const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const geminiService = require('../services/geminiService');
const Presentation = require('../models/Presentation');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * POST /api/ai-images/generate
 * Generate AI images for a product using presentation templates
 */
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        console.log('Request body received:', JSON.stringify(req.body, null, 2));
        const { producto, presentaciones } = req.body;

        if (!producto || !presentaciones || !Array.isArray(presentaciones)) {
            console.log('Validation failed:', { producto, presentaciones, isArray: Array.isArray(presentaciones) });
            return res.status(400).json({
                success: false,
                error: 'Producto and presentaciones array are required'
            });
        }

        console.log(`Generating AI images for product: ${producto}`);
        console.log(`Presentations: ${presentaciones.map(p => p.id).join(', ')}`);

        // Get unique presentation template IDs
        const uniqueTemplateIds = [...new Set(presentaciones.map(p => p.id))];
        console.log('Unique template IDs:', uniqueTemplateIds);
        
        // Fetch presentation templates from database
        const presentationIds = uniqueTemplateIds.map(id => new mongoose.Types.ObjectId(id));
        const presentations = await Presentation.find({ 
            _id: { $in: presentationIds } 
        });

        if (presentations.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No presentation templates found'
            });
        }

        // Create a map of template ID to template data for quick lookup
        const templateMap = {};
        presentations.forEach(presentation => {
            templateMap[presentation._id.toString()] = presentation;
        });

        // Prepare presentations with base64 data and prompt text
        // Process each presentation entry from frontend (including multiple quantities)
        const presentationsWithData = presentaciones.map(presData => {
            const template = templateMap[presData.id];
            if (!template) {
                console.error(`Template not found for ID: ${presData.id}`);
                return null;
            }
            
            return {
                id: presData.id,
                name: template.name,
                presentacion: presData.presentacion,
                templateName: presData.templateName,
                text: template.promptText || '',
                base64Image: template.templateImage || ''
            };
        }).filter(p => p !== null); // Remove null entries

        // Filter out presentations without base64 data
        const validPresentations = presentationsWithData.filter(p => p.base64Image);
        
        if (validPresentations.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No presentation templates with base64 data found'
            });
        }

        // Generate AI images
        const results = await geminiService.generateMultipleProductImages(
            producto, 
            validPresentations
        );

        res.json({
            success: true,
            results: results.map((result, index) => ({
                presentationId: validPresentations[index].id,
                presentationName: validPresentations[index].name,
                presentacion: result.presentacion,
                success: result.success,
                imageData: result.success ? result.imageData : null,
                mimeType: result.success ? result.mimeType : null,
                error: result.success ? null : result.error
            }))
        });

    } catch (error) {
        console.error('Error in AI image generation endpoint:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Internal server error during AI image generation',
            details: error.message
        });
    }
});

/**
 * POST /api/ai-images/generate-single
 * Generate a single AI image for testing
 */
router.post('/generate-single', authMiddleware, async (req, res) => {
    try {
        const { producto, presentacion, base64Image } = req.body;

        if (!producto || !presentacion) {
            return res.status(400).json({
                success: false,
                error: 'Producto and presentacion are required'
            });
        }

        console.log(`Generating single AI image for product: ${producto}, presentation: ${presentacion}`);

        // For testing, use a placeholder base64 image if none provided
        const testBase64Image = base64Image || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

        const defaultPrompt = "Edita exclusivamente la zona blanca de la etiqueta del producto, ese espacio vacío en blanco es el único lugar editable; en él agrega el nombre del producto: {producto} y debajo su presentación: {presentación}, con apariencia real de impresión en etiqueta; utiliza tipografía sans-serif moderna (Helvetica/Inter/Roboto o similar), color negro puro (#000000) sin contornos ni efectos, el nombre en seminegrita/medium y la presentación en regular/medium a un 70–80% del tamaño del nombre, alineada a la izquierda; si el nombre es largo divídelo automáticamente en dos líneas en lugar de reducir demasiado el tamaño; mantén márgenes internos del 4–6% para que el texto no se salga del área, aplica ligera curvatura/perspectiva para que ambas líneas sigan la forma cilíndrica del envase y se perciban adheridas a la etiqueta, simulando tinta impresa sin añadir gráficos ni efectos extra, conservando la iluminación, textura y proporciones originales del envase, con resultado nítido, fotorealista y sin artefactos.";
        const result = await geminiService.generateProductImage(producto, presentacion, testBase64Image, defaultPrompt);

        res.json({
            success: result.success,
            imageData: result.success ? result.imageData : null,
            mimeType: result.success ? result.mimeType : null,
            error: result.success ? null : result.error
        });

    } catch (error) {
        console.error('Error in single AI image generation endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during AI image generation'
        });
    }
});

/**
 * GET /api/ai-images/test
 * Test endpoint to verify Gemini API connection
 */
router.get('/test', async (req, res) => {
    try {
        console.log('Testing Gemini API connection...');
        
        // Test with a simple 1x1 pixel PNG
        const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const defaultPrompt = "Edita exclusivamente la zona blanca de la etiqueta del producto, ese espacio vacío en blanco es el único lugar editable; en él agrega el nombre del producto: {producto} y debajo su presentación: {presentación}, con apariencia real de impresión en etiqueta; utiliza tipografía sans-serif moderna (Helvetica/Inter/Roboto o similar), color negro puro (#000000) sin contornos ni efectos, el nombre en seminegrita/medium y la presentación en regular/medium a un 70–80% del tamaño del nombre, alineada a la izquierda; si el nombre es largo divídelo automáticamente en dos líneas en lugar de reducir demasiado el tamaño; mantén márgenes internos del 4–6% para que el texto no se salga del área, aplica ligera curvatura/perspectiva para que ambas líneas sigan la forma cilíndrica del envase y se perciban adheridas a la etiqueta, simulando tinta impresa sin añadir gráficos ni efectos extra, conservando la iluminación, textura y proporciones originales del envase, con resultado nítido, fotorealista y sin artefactos.";
        const result = await geminiService.generateProductImage('Test Product', 'Test Presentation', testBase64, defaultPrompt);
        
        res.json({
            success: result.success,
            message: result.success ? 'Gemini API is working correctly' : 'Gemini API test failed',
            error: result.success ? null : result.error
        });

    } catch (error) {
        console.error('Error testing Gemini API:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test Gemini API connection',
            details: error.message
        });
    }
});

module.exports = router;
