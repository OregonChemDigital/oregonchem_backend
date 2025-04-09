const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const Presentation = require('./src/models/Presentation');
const Banner = require('./src/models/Banner');

const uri = process.env.MONGODB_URI_PROD;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Production Database');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
    // Get counts for each collection
    console.log('\nDocument counts:');
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Presentations: ${await Presentation.countDocuments()}`);
    console.log(`Banners: ${await Banner.countDocuments()}`);
    
    // List all products
    console.log('\nProducts:');
    const products = await Product.find().lean();
    products.forEach(product => console.log(`- ${product.name} (${product._id})`));
    
    // List all categories
    console.log('\nCategories:');
    const categories = await Category.find().lean();
    categories.forEach(category => console.log(`- ${category.name} (${category._id})`));
    
    // List all presentations
    console.log('\nPresentations:');
    const presentations = await Presentation.find().lean();
    presentations.forEach(presentation => console.log(`- ${presentation.name} (${presentation._id})`));
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });
