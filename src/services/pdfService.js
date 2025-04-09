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

            // Company Info
            doc
                .fontSize(16)
                .fillColor('#2c3e50')
                .text(siteConfig.name, 150, 50);

            doc
                .fontSize(10)
                .fillColor('#7f8c8d')
                .text(siteConfig.address, 150, 70)
                .text(`Tel: ${siteConfig.phone}`, 150, 85)
                .text(`Email: ${siteConfig.email}`, 150, 100);

            // === Quote Title ===
            doc
                .moveDown(2)
                .fontSize(20)
                .fillColor('#e74c3c')
                .text('COTIZACIÓN', { align: 'center' })
                .moveDown();

            // === Quote Details ===
            doc
                .fontSize(12)
                .fillColor('#2c3e50')
                .text(`Número: ${quote._id}`)
                .text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-PE')}`);

            // === Client Information ===
            doc
                .moveDown()
                .fontSize(14)
                .fillColor('#e74c3c')
                .text('INFORMACIÓN DEL CLIENTE')
                .moveDown();

            doc
                .fontSize(12)
                .fillColor('#2c3e50')
                .text(`Nombre: ${quote.client.name} ${quote.client.lastname}`)
                .text(`Email: ${quote.client.email}`)
                .text(`Teléfono: ${quote.client.phone}`);

            if (quote.client.company) doc.text(`Empresa: ${quote.client.company}`);
            if (quote.client.ruc) doc.text(`RUC: ${quote.client.ruc}`);
            if (quote.contactMethod) doc.text(`Método de contacto preferido: ${quote.contactMethod}`);

            // === Products Section ===
            doc
                .moveDown()
                .fontSize(14)
                .fillColor('#e74c3c')
                .text('PRODUCTOS SOLICITADOS')
                .moveDown();

            // Table header start position
            const startY = doc.y;

            // Finish writing the document
            doc.end();
        })();
    });
};

module.exports = generatePDF;
