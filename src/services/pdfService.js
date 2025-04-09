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
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true
        });

        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Use default site configuration
        const siteConfig = defaultSiteConfig;

        // Set default font
        doc.font('Helvetica');

        // === Header with logo and company info ===
        (async () => {
            try {
                const logoExists = await fs.access(siteConfig.logo).then(() => true).catch(() => false);
                if (logoExists) {
                    doc.image(siteConfig.logo, 50, 50, { width: 80 });
                }
            } catch (error) {
                console.warn('Logo not found:', error.message);
            }

            // Company Info - aligned left below logo
            doc
                .fontSize(16)
                .fillColor('#2c3e50')
                .text(siteConfig.name, 50, 140);

            doc
                .fontSize(10)
                .fillColor('#7f8c8d')
                .text(siteConfig.address, 50, 160)
                .text(`Tel: ${siteConfig.phone}`, 50, 175)
                .text(`Email: ${siteConfig.email}`, 50, 190);

            // === Quote Title - centered ===
            doc
                .moveDown(2)
                .fontSize(20)
                .fillColor('#e74c3c')
                .text('COTIZACIÓN', { align: 'center' })
                .moveDown();

            // === Quote Details - aligned left with time ===
            doc
                .fontSize(12)
                .fillColor('#2c3e50')
                .text(`Número: ${quote._id}`, { align: 'left' })
                .text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-PE')}`, { align: 'left' })
                .text(`Hora: ${new Date(quote.createdAt).toLocaleTimeString('es-PE')}`, { align: 'left' });

            // === Client Information - aligned left ===
            doc
                .moveDown()
                .fontSize(14)
                .fillColor('#e74c3c')
                .text('INFORMACIÓN DEL CLIENTE', { align: 'left' })
                .moveDown();

            doc
                .fontSize(12)
                .fillColor('#2c3e50')
                .text(`Nombre: ${quote.client.name} ${quote.client.lastname}`, { align: 'left' })
                .text(`Email: ${quote.client.email}`, { align: 'left' })
                .text(`Teléfono: ${quote.client.phone}`, { align: 'left' });

            if (quote.client.company) doc.text(`Empresa: ${quote.client.company}`, { align: 'left' });
            if (quote.client.ruc) doc.text(`RUC: ${quote.client.ruc}`, { align: 'left' });
            if (quote.contactMethod) doc.text(`Método de contacto preferido: ${quote.contactMethod}`, { align: 'left' });

            // === Products Section ===
            doc
                .moveDown()
                .fontSize(14)
                .fillColor('#e74c3c')
                .text('PRODUCTOS SOLICITADOS', { align: 'left' })
                .moveDown();

            // Table header start position
            const startY = doc.y;

            // Table headers
            doc
                .fontSize(12)
                .fillColor('#2c3e50')
                .text('Producto', 50, startY)
                .text('Presentación', 200, startY)
                .text('Cantidad', 350, startY)
                .text('Frecuencia', 450, startY);

            // Table rows
            let y = startY + 20;
            quote.products.forEach(product => {
                doc
                    .fontSize(10)
                    .text(product.name, 50, y)
                    .text(product.presentation, 200, y)
                    .text(`${product.quantity} ${product.unit}`, 350, y)
                    .text(product.frequency, 450, y);
                y += 20;
            });

            // Finish writing the document
            doc.end();
        })();
    });
};

module.exports = generatePDF;
