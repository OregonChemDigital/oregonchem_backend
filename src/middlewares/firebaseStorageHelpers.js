const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");
const { initializeApp } = require("firebase/app");

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

const uploadFileToFirebase = (file, path) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file.buffer);

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
};

const handleFileUploads = async (req, basePath, entityName) => {
    if (!req.files) {
        return {};
    }

    const uploadPromises = Object.keys(req.files).flatMap((fieldName) => {
        const files = req.files[fieldName];
        return files.map(async (file) => {
            const fileExtension = file.originalname.split(".").pop();
            const storagePath = `${basePath}/${entityName}/${fieldName}/${entityName}_${fieldName}.${fileExtension}`;
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

