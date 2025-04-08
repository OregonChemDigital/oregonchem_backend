require('dotenv').config();
const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error('MongoDB URI is not defined in the environment.');
        }

        console.log(`Connecting to MongoDB: ${uri}`);
        await mongoose.connect(uri, {
            dbName: 'oregonchem_prod', // Explicitly connect to the correct DB
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = dbConnection;