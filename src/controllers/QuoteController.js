const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const Quote = require('../models/Quote');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const generatePDF = (quoteData) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.on('error', reject);

        doc.fontSize(18).text('Quote Details', { align: 'center' });
        doc.moveDown();
        
        // Client Information
        doc.fontSize(12).text(`Name: ${quoteData.clientInfo.name}`);
        doc.text(`Last Name: ${quoteData.clientInfo.lastName}`);
        doc.text(`DNI: ${quoteData.clientInfo.dni}`);
        doc.text(`Phone: ${quoteData.clientInfo.phone}`);
        doc.text(`Email: ${quoteData.clientInfo.email}`);
        doc.text(`Company: ${quoteData.clientInfo.company}`);
        doc.text(`Social Reason: ${quoteData.clientInfo.socialReason}`);
        doc.text(`RUC: ${quoteData.clientInfo.ruc}`);
        doc.text(`Contact Method: ${quoteData.contactMethod}`);
        doc.text(`Observations: ${quoteData.observations}`);

        // Product Details
        doc.moveDown();
        doc.text('Selected Products:');
        quoteData.selectedProducts.forEach((product, index) => {
            doc.moveDown();
            doc.text(`Product ${index + 1}:`);
            doc.text(`- Name: ${product.name}`);
            doc.text(`- Volume: ${product.volume}`);
            doc.text(`- Presentation: ${product.presentation}`);
        });

        doc.end();
    });
};

const sendEmail = async (pdfData, recipient, type) => {
    const isClient = type === 'client';
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: isClient
            ? 'Hemos recibido tu solicitud de cotización'
            : 'Nueva solicitud de cotización recibida',
        text: isClient
            ? 'Gracias por contactarnos. Adjuntamos tu cotización personalizada.'
            : 'Nuevo formulario recibido desde quimicaindustrial',
        attachments: [{ filename: 'quote.pdf', content: pdfData }],
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

const createQuote = async (req, res) => {
    try {
        const quoteData = req.body;
        const newQuote = new Quote(quoteData);
        await newQuote.save();

        const pdfData = await generatePDF(quoteData);
        await Promise.all([
            sendEmail(pdfData, quoteData.clientInfo.email, 'client'),
            sendEmail(pdfData, process.env.EMAIL_USER, 'company')
        ]);

        res.status(200).json({ message: 'Quote sent successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create quote',
            error: error.message 
        });
    }
};

module.exports = { createQuote };
