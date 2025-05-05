const multer = require("multer");
const { uploadFileToFirebase } = require("./firebaseStorageHelpers");

const multerStorage = multer.memoryStorage();

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
});

const handleBannerUploads = async (req, res, next) => {
    try {
        console.log('Banner upload request received:', {
            body: req.body,
            file: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : null
        });

        const { name, site } = req.body;
        
        if (!name) {
            console.error('Banner name is missing');
            return res.status(400).json({ message: "Banner name is required" });
        }

        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ message: "File is required for banners" });
        }

        const file = req.file;

        try {
            const fileExtension = file.originalname.split(".").pop().toLowerCase();
            if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                console.error('Invalid file type:', fileExtension);
                return res.status(400).json({ message: "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed" });
            }

            const storagePath = `banners/${site || 'site1'}/${name}_${site || 'site1'}.${fileExtension}`;
            console.log('Uploading to storage path:', storagePath);
            
            file.downloadURL = await uploadFileToFirebase(file, storagePath);
            console.log('File uploaded successfully:', file.downloadURL);
            
            req.file = file; // Overwrite req.file with the uploaded file containing the download URL
            next();
        } catch (error) {
            console.error("Error uploading banner file:", error);
            return res.status(500).json({ 
                message: "Error uploading banner image", 
                error: error.message,
                details: error.stack
            });
        }
    } catch (error) {
        console.error("Error in handleBannerUploads:", error);
        return res.status(500).json({ 
            message: "Error processing banner upload", 
            error: error.message,
            details: error.stack
        });
    }
};

module.exports = { upload, handleBannerUploads };