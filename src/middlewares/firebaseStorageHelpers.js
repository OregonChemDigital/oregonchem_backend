const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");
const { initializeApp } = require("firebase/app");
const sharp = require('sharp');

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

const uploadFileToFirebase = async (file, path) => {
    try {
        const jpgPath = path.replace(/\.[^/.]+$/, '.jpg');

        const jpgBuffer = await sharp(file.buffer)
            .resize(1920, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ 
                quality: 70,
                progressive: true,
                optimizeCoding: true,
                mozjpeg: true,
                chromaSubsampling: '4:2:0'
            })
            .toBuffer();

        const storageRef = ref(storage, jpgPath);
        const uploadTask = uploadBytesResumable(storageRef, jpgBuffer);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                reject,
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        reject(new Error(`Failed to get download URL: ${error.message}`));
                    }
                }
            );
        });
    } catch (error) {
        throw new Error(`Failed to process image: ${error.message}`);
    }
};

const handleFileUploads = async (req, basePath, entityName) => {
    if (!req.files) {
        return {};
    }

    const sanitizedEntityName = entityName
        .replace(/\s+/g, '_')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');

    const uploadPromises = Object.keys(req.files).flatMap((fieldName) => {
        const files = req.files[fieldName];
        return files.map(async (file) => {
            const siteMatch = fieldName.match(/site(\d+)/);
            const siteNumber = siteMatch ? siteMatch[1] : '1';
            
            let storagePath;
            switch (basePath) {
                case 'products':
                    storagePath = `products/${sanitizedEntityName}/site${siteNumber}/${sanitizedEntityName}_site${siteNumber}.jpg`;
                    break;
                case 'categories':
                    storagePath = `categories/${sanitizedEntityName}/site${siteNumber}/${sanitizedEntityName}_site${siteNumber}.jpg`;
                    break;
                case 'presentations':
                    storagePath = `presentations/${sanitizedEntityName}/site${siteNumber}/${sanitizedEntityName}_site${siteNumber}.jpg`;
                    break;
                case 'banners':
                    storagePath = `banners/site${siteNumber}/${sanitizedEntityName}_site${siteNumber}.jpg`;
                    break;
                default:
                    throw new Error(`Invalid base path: ${basePath}`);
            }

            const downloadURL = await uploadFileToFirebase(file, storagePath);
            return { ...file, downloadURL };
        });
    });

    try {
        const uploadedFiles = await Promise.all(uploadPromises);
        return uploadedFiles.reduce((acc, file) => {
            const key = file.fieldname;
            if (!acc[key]) acc[key] = [];
            acc[key].push(file);
            return acc;
        }, {});
    } catch (error) {
        throw new Error(`Failed to handle file uploads: ${error.message}`);
    }
};

module.exports = { uploadFileToFirebase, handleFileUploads };

