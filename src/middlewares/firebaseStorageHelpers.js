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
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

const handleFileUploads = async (req, basePath, entityName) => {
    const uploadPromises = Object.keys(req.files).flatMap((fieldName) => {
        const files = req.files[fieldName];
        return files.map(async (file) => {
            const fileExtension = file.originalname.split(".").pop();
            const storagePath = `${basePath}/${entityName}/${fieldName}/${entityName}_${fieldName}.${fileExtension}`;
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

module.exports = { uploadFileToFirebase, handleFileUploads };

