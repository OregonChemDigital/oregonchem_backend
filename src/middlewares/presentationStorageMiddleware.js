const multer = require("multer");
const { handleFileUploads } = require("./firebaseStorageHelpers");

const multerStorage = multer.memoryStorage();

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
});

const handlePresentationUploads = async (req, res, next) => {
    const { name } = req.body;
    if (!req.files) req.files = {};
    if (!name) return res.status(400).json({ message: "Presentation name is required" });

    try {
        req.files = await handleFileUploads(req, `presentations`, name);
        next();
    } catch (error) {
        console.error("Error uploading presentation files:", error);
        return res.status(500).json({ message: "Error uploading presentation files", error: error.message });
    }
};

module.exports = { upload, handlePresentationUploads };