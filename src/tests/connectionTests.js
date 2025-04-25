const mongoose = require('mongoose');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Debug environment variables (without sensitive values)
console.log('🔍 Checking Environment Variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'Set' : 'Not set');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set');
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL ? 'Set' : 'Not set');
console.log('GOOGLE_CLOUD_STORAGE_BUCKET:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET ? 'Set' : 'Not set');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET
        });
        console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
        console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    }
}

async function testMongoDBConnection() {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI_PROD);
            console.log('MongoDB connection attempt completed');
        }
        
        const readyState = mongoose.connection.readyState;
        if (readyState === 1) {
            console.log('✅ MongoDB Connection: Connected');
            return true;
        } else {
            console.log('❌ MongoDB Connection: Not connected (State:', readyState, ')');
            return false;
        }
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        return false;
    }
}

async function testFirebaseConnection() {
    try {
        // Verify Firebase Admin SDK is initialized
        if (!admin.apps.length) {
            throw new Error('Firebase Admin SDK not initialized');
        }
        
        // Test Firebase connection by listing users
        console.log('Testing Firebase connection...');
        await admin.auth().listUsers(1);
        console.log('✅ Firebase Connection: Connected');
        return true;
    } catch (error) {
        console.error('❌ Firebase Connection Error:', error.message);
        return false;
    }
}

async function runConnectionTests() {
    console.log('🔍 Running Connection Tests...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    try {
        const mongoResult = await testMongoDBConnection();
        const firebaseResult = await testFirebaseConnection();
        
        if (mongoResult && firebaseResult) {
            console.log('✅ All connections successful!');
            process.exit(0);
        } else {
            console.log('❌ Some connections failed!');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Test execution error:', error.message);
        process.exit(1);
    } finally {
        // Clean up connections
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runConnectionTests();
}

module.exports = {
    testMongoDBConnection,
    testFirebaseConnection,
    runConnectionTests
}; 