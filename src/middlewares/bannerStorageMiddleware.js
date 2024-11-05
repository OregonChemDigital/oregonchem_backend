const multer = require("multer");
const { uploadFileToFirebase } = require("./firebaseStorageHelpers");

const multerStorage = multer.memoryStorage();

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 1024 * 1024 * 3 }, // 3 MB limit
});

const handleBannerUploads = async (req, res, next) => {
    const { name, site } = req.body;
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "File is required for banners" });
    }

    const file = req.files[0]; // Assuming a single file for banners
    if (!file) return res.status(400).json({ message: "File is required" });

    try {
        const fileExtension = file.originalname.split(".").pop();
        const storagePath = `banners/${site || 'site1'}/${name}_${site || 'site1'}.${fileExtension}`;
        file.downloadURL = await uploadFileToFirebase(file, storagePath);
        req.files = [file]; // Overwrite req.files with the uploaded file containing the download URL
        next();
    } catch (error) {
        console.error("Error uploading banner file:", error);
        return res.status(500).json({ message: "Error uploading banner image", error: error.message });
    }
};

module.exports = { upload, handleBannerUploads };

