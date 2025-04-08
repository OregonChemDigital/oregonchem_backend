const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => mongoose.connection.close())
  .catch(err => {
    throw new Error(`MongoDB connection failed: ${err.message}`);
  });
