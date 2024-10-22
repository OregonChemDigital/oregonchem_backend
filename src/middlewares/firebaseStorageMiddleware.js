const multer = require("multer");
const { initializeApp } = require("firebase/app");
const {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} = require("firebase/storage");

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const multerStorage = multer.memoryStorage();

const uploadFileToFirebase = (file, path) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file.buffer);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            reject,
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

const handleFileUploads = async (req, basePath, fileName) => {
    const uploadPromises = Object.keys(req.files).flatMap((fieldName) => {
        const files = req.files[fieldName];
        return files.map(async (file) => {
            const fileExtension = file.originalname.split(".").pop();
            const storagePath = `${basePath}/${fileName}/${fieldName}/${fileName}_${fieldName}.${fileExtension}`;
            const downloadURL = await uploadFileToFirebase(file, storagePath);
            return { ...file, downloadURL };
        });
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    req.files = uploadedFiles.reduce((acc, file) => {
        const key = file.fieldname;
        if (!acc[key]) acc[key] = [];
        acc[key].push(file);
        return acc;
    }, {});

    return req.files;
};

const firebaseStorageMiddleware = async (req, res, next) => {
    const {
        originalUrl,
        file,
        files,
        body: { name },
    } = req;

    if (!file && !files) return next();

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    const site =
        (req.files && Object.keys(req.files).find((field) => req.files[field])) ||
        "site1";

    if (originalUrl.includes("/productos")) {
        try {
            req.files = await handleFileUploads(req, `products`, name);
            return next();
        } catch (error) {
            console.error("Error uploading product files:", error);
            return res.status(500).json({
                message: "Error uploading product files",
                error: error.message,
            });
        }
    }

    if (originalUrl.includes("/categorias")) {
        try {
            req.files = await handleFileUploads(req, `categories`, name);
            return next();
        } catch (error) {
            console.error("Error uploading category files:", error);
            return res.status(500).json({
                message: "Error uploading category files",
                error: error.message,
            });
        }
    }

    if (originalUrl.includes("/presentaciones")) {
        try {
            req.files = await handleFileUploads(req, `presentations`, name);
            return next();
        } catch (error) {
            console.error("Error uploading presentation files:", error);
            return res.status(500).json({
                message: "Error uploading presentation files",
                error: error.message,
            });
        }
    }

    if (originalUrl.includes("/banners")) {
        const site = req.body.site || "site1";

        if (!file) {
            return res.status(400).json({ message: "File is required for banners" });
        }

        try {
            const fileExtension = file.originalname.split(".").pop();
            const storagePath = `banners/${site}/${name}_${site}.${fileExtension}`;
            console.log(`Uploading to path: ${storagePath}`);
            file.downloadURL = await uploadFileToFirebase(file, storagePath);
            return next();
        } catch (error) {
            console.error("Error uploading banner file:", error);
            return res.status(500).json({
                message: "Error uploading banner image",
                error: error.message,
            });
        }
    }

    return res.status(400).json({ message: "Invalid route for file upload" });
};

const upload = multer({
    storage: multerStorage,
    limits: {
        fileSize: 1024 * 1024 * 3,
    },
});

module.exports = { upload, firebaseStorageMiddleware };