const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

// Site-specific configurations
const siteConfigs = {
    quimicaindustrialpe: {
        name: 'Química Industrial Perú',
        address: 'Dirección de la empresa',
        phone: 'Teléfono de contacto',
        email: 'correo@quimicaindustrialpe.com',
        logo: path.join(__dirname, '../../public/qiLogo.png') // Updated path to public directory
    },
    // Add configurations for other sites
};

const generatePDF = async (quote) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const siteConfig = siteConfigs[quote.site.id];

        // Header
        try {
            // Check if logo file exists before trying to use it
            if (siteConfig.logo && fs.existsSync(siteConfig.logo)) {
                doc.image(siteConfig.logo, 50, 50, { width: 100 });
            }
        } catch (error) {
            console.warn(`Logo not found for site ${quote.site.id}:`, error.message);
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

        // Products
        doc.moveDown();
        doc.fontSize(14).text('PRODUCTOS SOLICITADOS');
        
        // Table header
        const startY = doc.y;
        doc.fontSize(12);
        doc.text('Producto', 50, startY);
        doc.text('Cantidad', 200, startY);
        doc.text('Unidad', 350, startY);
        
        // Table rows
        let y = startY + 20;
        quote.products.forEach(product => {
            doc.text(product.name, 50, y);
            doc.text(product.quantity.toString(), 200, y);
            doc.text(product.unit, 350, y);
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
           .text(siteConfig.name, 50, pageHeight - 80, { align: 'center' });

        doc.end();
    });
};

module.exports = {
    generatePDF
}; 