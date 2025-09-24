const fetch = require('node-fetch');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCtYz3ls8Y2257jNN5Ru2P9bVBFKdkgWko';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';
    }

    /**
     * Generate AI image by editing the white label area of a presentation template
     * @param {string} producto - Product name
     * @param {string} presentacion - Presentation/quantity
     * @param {string} base64Image - Base64 encoded template image
     * @param {string} text - Custom prompt text with placeholders
     * @returns {Promise<Object>} Generated image data
     */
    async generateProductImage(producto, presentacion, base64Image, text) {
        try {
            console.log(`Generating AI image for product: ${producto}, presentation: ${presentacion}`);
            console.log(`Text parameter received:`, text);
            console.log(`Text type:`, typeof text);
            
            // Replace placeholders in the stored prompt text
            const defaultPrompt = "Edita exclusivamente la zona blanca de la etiqueta del producto, ese espacio vacío en blanco es el único lugar editable; en él agrega el nombre del producto: {producto} y debajo su presentación: {presentación}, con apariencia real de impresión en etiqueta; utiliza tipografía sans-serif moderna (Helvetica/Inter/Roboto o similar), color negro puro (#000000) sin contornos ni efectos, el nombre en seminegrita/medium y la presentación en regular/medium a un 70–80% del tamaño del nombre, alineada a la izquierda; si el nombre es largo divídelo automáticamente en dos líneas en lugar de reducir demasiado el tamaño; mantén márgenes internos del 4–6% para que el texto no se salga del área, aplica ligera curvatura/perspectiva para que ambas líneas sigan la forma cilíndrica del envase y se perciban adheridas a la etiqueta, simulando tinta impresa sin añadir gráficos ni efectos extra, conservando la iluminación, textura y proporciones originales del envase, con resultado nítido, fotorealista y sin artefactos.";
            
            const text = text || defaultPrompt;
            const prompt = text
                .replace(/{producto}/g, producto)
                .replace(/{presentación}/g, presentacion);

            const requestBody = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inline_data: {
                                    mime_type: "image/png",
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            };

            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error:', response.status, errorText);
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Gemini API response received');

            // Extract the generated image data
            if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                const content = result.candidates[0].content;
                
                if (content.parts) {
                    // Check all parts for inlineData (image data)
                    for (let i = 0; i < content.parts.length; i++) {
                        if (content.parts[i] && content.parts[i].inlineData) {
                            console.log(`Found image data in part ${i}, length: ${content.parts[i].inlineData.data?.length || 0} characters`);
                            return {
                                success: true,
                                imageData: content.parts[i].inlineData.data,
                                mimeType: content.parts[i].inlineData.mimeType || 'image/png'
                            };
                        }
                    }
                }
            }

            throw new Error('No image data found in Gemini API response');

        } catch (error) {
            console.error('Error generating AI image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate multiple product images for different presentations
     * @param {string} producto - Product name
     * @param {Array} presentations - Array of {presentacion, base64Image} objects
     * @returns {Promise<Array>} Array of generated image results
     */
    async generateMultipleProductImages(producto, presentations) {
        try {
            console.log(`Generating ${presentations.length} AI images for product: ${producto}`);
            
            const promises = presentations.map(async (pres) => {
                const result = await this.generateProductImage(producto, pres.presentacion, pres.base64Image, pres.text);
                return {
                    presentacion: pres.presentacion,
                    ...result
                };
            });

            const results = await Promise.all(promises);
            console.log(`Generated ${results.length} AI images`);
            
            return results;
        } catch (error) {
            console.error('Error generating multiple AI images:', error);
            return presentations.map(pres => ({
                presentacion: pres.presentacion,
                success: false,
                error: error.message
            }));
        }
    }
}

module.exports = new GeminiService();
