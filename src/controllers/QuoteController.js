const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

const createQuote = async (req, res) => {
    const { selectedProducts, clientType, clientInfo, contactMethod, observations, termsAccepted } = req.body;

    // Create PDF document
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
        const pdfData = Buffer.concat(buffers);

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'oregonchemdigital@gmail.com', // your email address
                pass: '4r2g4nch2md3g3t1l!' // your password or app password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: clientInfo.email,
            subject: "Your Quote",
            text: "Please find attached your quote.",
            attachments: [
                {
                    filename: "quote.pdf",
                    content: pdfData,
                },
            ],
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).send("Quote sent successfully");
        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).send("Error sending quote");
        }
    });

    // Add content to PDF
    doc.fontSize(25).text("Quote", { align: "center" });
    doc.text("Client Info:");
    doc.text(`Name: ${clientInfo.name} ${clientInfo.lastName}`);
    doc.text(`Email: ${clientInfo.email}`);
    doc.text(`Phone: ${clientInfo.phone}`);
    doc.text("Selected Products:");

    selectedProducts.forEach((product) => {
        doc.text(`- ${product.name}, Volume: ${product.volume}, Presentation: ${product.presentation}`);
    });

    doc.text("Observations: " + observations);
    doc.text("Terms Accepted: " + (termsAccepted ? "Yes" : "No"));

    doc.end();
};

module.exports = {
    createQuote,
};
