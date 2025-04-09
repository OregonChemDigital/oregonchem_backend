const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Load email templates
const loadTemplate = (templateName) => {
    const templatePath = path.join(__dirname, '../templates', templateName);
    const template = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(template);
};

const companyTemplate = loadTemplate('quimicaindustrialpe/company-notification.html');
const clientTemplate = loadTemplate('quimicaindustrialpe/client-confirmation.html');

const sendQuoteEmail = async (quote, pdfBuffer) => {
    try {
        // Format products for email template
        const formattedProducts = quote.products.map((product, index) => `
            <div class="product-item">
                <p><strong>${index + 1}. Producto:</strong> ${product.name}</p>
                <p><strong>Presentación:</strong> ${product.presentation || '-'}</p>
                <p><strong>Cantidad:</strong> ${product.quantity} ${product.unit}</p>
                <p><strong>Frecuencia:</strong> ${product.frequency || '-'}</p>
            </div>
        `).join('');

        // Send email to company
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.COMPANY_EMAIL,
            subject: `Nueva Cotización - ${quote.client.name}`,
            html: companyTemplate({
                logo: process.env.COMPANY_LOGO_URL,
                quoteId: quote._id,
                date: new Date(quote.createdAt).toLocaleDateString('es-PE'),
                clientName: `${quote.client.name} ${quote.client.lastName || ''}`,
                clientInfo: quote.client,
                contactMethod: quote.contactMethod,
                products: formattedProducts,
                observations: quote.observations,
                companyName: process.env.COMPANY_NAME,
                companyAddress: process.env.COMPANY_ADDRESS,
                companyPhone: process.env.COMPANY_PHONE,
                companyEmail: process.env.COMPANY_EMAIL
            }),
            attachments: [
                {
                    filename: `cotizacion-${quote._id}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        // Send confirmation email to client
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: quote.client.email,
            subject: 'Confirmación de Cotización - Química Industrial Perú',
            html: clientTemplate({
                logo: process.env.COMPANY_LOGO_URL,
                quoteId: quote._id,
                date: new Date(quote.createdAt).toLocaleDateString('es-PE'),
                products: formattedProducts,
                observations: quote.observations,
                companyName: process.env.COMPANY_NAME,
                companyAddress: process.env.COMPANY_ADDRESS,
                companyPhone: process.env.COMPANY_PHONE,
                companyEmail: process.env.COMPANY_EMAIL
            })
        });

        return true;
    } catch (error) {
        console.error('Error sending quote emails:', error);
        throw error;
    }
};

module.exports = {
    sendQuoteEmail
}; 