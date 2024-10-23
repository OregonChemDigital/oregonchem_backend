const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

const generatePDF = (quoteData) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        sendEmail(pdfData, quoteData.clientInfo.email); // Call sendEmail here with pdfData and client email
    });

    doc.fontSize(18).text('Quote Details', { align: 'center' });
    doc.moveDown();
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

    // Add product details
    quoteData.selectedProducts.forEach((product, index) => {
        doc.text(`\nProduct ${index + 1}:`);
        doc.text(`- Name: ${product.name}`);
        doc.text(`- Volume: ${product.volume}`);
        doc.text(`- Presentation: ${product.presentation}`);
    });

    doc.end();
};

const sendEmail = async (pdfData, email) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'oregonchemdigital@gmail.com',
            pass: '4r2g4nch2md3g3t1l!'
        }
    });

    let mailOptions = {
        from: 'oregonchemdigital@gmail.com',
        to: email,
        subject: 'Your Personalized Quote',
        text: 'Attached is your personalized quote.',
        attachments: [
            { filename: 'quote.pdf', content: pdfData }
        ]
    };

    await transporter.sendMail(mailOptions);
};

const createQuote = async (req, res) => {
    try {
        const quoteData = req.body;
        generatePDF(quoteData);
        res.status(200).json({ message: 'Quote sent successfully!' });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Failed to create quote.' });
    }
};

module.exports = { createQuote };

