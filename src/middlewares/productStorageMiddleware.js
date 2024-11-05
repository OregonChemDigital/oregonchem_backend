const multer = require("multer");
const { handleFileUploads } = require("./firebaseStorageHelpers");

const multerStorage = multer.memoryStorage();

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 1024 * 1024 * 3 }, // 3 MB limit
});

const handleProductUploads = async (req, res, next) => {
    const { name } = req.body;
    if (!req.files) return next();
    if (!name) return res.status(400).json({ message: "Product name is required" });

    try {
        req.files = await handleFileUploads(req, `products`, name);
        next();
    } catch (error) {
        console.error("Error uploading product files:", error);
        return res.status(500).json({ message: "Error uploading product files", error: error.message });
    }
};

module.exports = { upload, handleProductUploads };

