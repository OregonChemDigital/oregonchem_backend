const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

// Default site configuration
const defaultSiteConfig = {
    name: 'Química Industrial Perú',
    address: 'Av. Industrial 123, Lima, Perú',
    phone: '+51 1 123 4567',
    email: 'contacto@quimicaindustrialpe.com',
    logo: path.join(__dirname, '../../public/qiLogo.png')
};

const generatePDF = async (quote) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Always use default site configuration
        const siteConfig = defaultSiteConfig;

        // Header
        try {
            // Check if logo file exists before trying to use it
            if (siteConfig.logo && fs.existsSync(siteConfig.logo)) {
                doc.image(siteConfig.logo, 50, 50, { width: 100 });
            }
        } catch (error) {
            console.warn('Logo not found:', error.message);
        }

        doc.fontSize(20).text(siteConfig.name, 170, 50);
        doc.fontSize(10).text(siteConfig.address, 170, 80);
        doc.text(`Tel: ${siteConfig.phone}`, 170, 95);
        doc.text(`Email: ${siteConfig.email}`, 170, 110);

        // Quote Information
        doc.moveDown(2);
        doc.fontSize(16).text('COTIZACIÓN', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Número: ${quote._id}`);
        doc.text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-PE')}`);

        // Client Information
        doc.moveDown();
        doc.fontSize(14).text('INFORMACIÓN DEL CLIENTE');
        doc.fontSize(12);
        doc.text(`Nombre: ${quote.client.name}`);
        doc.text(`Email: ${quote.client.email}`);
        doc.text(`Teléfono: ${quote.client.phone}`);
        if (quote.client.company) {
            doc.text(`Empresa: ${quote.client.company}`);
        }
        if (quote.client.ruc) {
            doc.text(`RUC: ${quote.client.ruc}`);
        }
        if (quote.contactMethod) {
            doc.text(`Método de contacto preferido: ${quote.contactMethod}`);
        }

        // Products
        doc.moveDown();
        doc.fontSize(14).text('PRODUCTOS SOLICITADOS');
        
        // Table header
        const startY = doc.y;
        doc.fontSize(12);
        doc.text('Producto', 50, startY);
        doc.text('Presentación', 200, startY);
        doc.text('Cantidad', 300, startY);
        doc.text('Frecuencia', 400, startY);
        
        // Table rows
        let y = startY + 20;
        quote.products.forEach(product => {
            doc.text(product.name, 50, y);
            doc.text(product.presentation, 200, y);
            doc.text(`${product.quantity} ${product.unit}`, 300, y);
            doc.text(product.frequency, 400, y);
            y += 20;
        });

        // Observations
        if (quote.observations) {
            doc.moveDown();
            doc.fontSize(14).text('OBSERVACIONES');
            doc.fontSize(12).text(quote.observations);
        }

        // Footer
        const pageHeight = doc.page.height;
        doc.fontSize(10)
           .text('Gracias por su preferencia', 50, pageHeight - 100, { align: 'center' })
           .text(siteConfig.name, 50, pageHeight - 80, { align: 'center' })
           .text(`Tel: ${siteConfig.phone}`, 50, pageHeight - 60, { align: 'center' })
           .text(`Email: ${siteConfig.email}`, 50, pageHeight - 40, { align: 'center' });

        doc.end();
    });
};

module.exports = {
    generatePDF
}; 