const { generatePDF } = require('../services/pdfService');

// Mock quote data for preview
const mockQuote = {
    _id: 'Q-2024-001',
    createdAt: new Date(),
    client: {
        name: 'Juan',
        lastname: 'Pérez',
        email: 'juan@example.com',
        phone: '+51 987 654 321',
        company: 'Empresa de Prueba',
        ruc: '12345678901'
    },
    products: [
        {
            name: 'Producto de Prueba',
            presentation: '1L',
            quantity: 10,
            unit: 'unidades',
            frequency: 'mensual'
        },
        {
            name: 'Otro Producto',
            presentation: '5L',
            quantity: 5,
            unit: 'unidades',
            frequency: 'quincenal'
        }
    ],
    observations: 'Estas son algunas observaciones de prueba para el preview.',
    contactMethod: 'email'
};

// Generate and save the preview PDF
async function generatePreview() {
    try {
        const pdfBuffer = await generatePDF(mockQuote);
        require('fs').writeFileSync('preview.pdf', pdfBuffer);
    } catch (error) {
        console.error('Error generating preview PDF:', error);
    }
}

generatePreview(); 