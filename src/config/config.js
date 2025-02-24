require('dotenv').config();
const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        const uri =
            process.env.NODE_ENV === 'production'
                ? process.env.MONGODB_URI_PROD
                : process.env.MONGODB_URI;

        if (!uri) {
            throw new Error('MongoDB URI is not defined in the environment.');
        }

        console.log(`Connecting to MongoDB: ${uri}`);
        await mongoose.connect(uri, {
            dbName: 'oregonchem_prod',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = dbConnection;



