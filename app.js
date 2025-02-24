const express = require("express");
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./src/routes/apiRoutes");
const authRouter = require("./src/routes/authRoutes");
const { admin, bucket, auth } = require(path.resolve(__dirname, 'src/config/firebaseAdmin'));
const { createQuote } = require(path.resolve(__dirname, 'src/controllers/QuoteController'));
const { Product } = require('./src/models/Product'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
const dbConnection = require(path.resolve(__dirname, 'src/config/config'));
console.log('Current NODE_ENV:', process.env.NODE_ENV);
dbConnection();

// CORS options
const allowedOrigins = [
    'http://localhost:4321', // Local development frontend
    'https://quimicaindustrialpe.com', // Production frontend domain (replace with the correct one)
  ];
  
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  };

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow preflight requests for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Routes
app.use("/api", routes);
app.use("/auth", authRouter);
app.post('/api/quotes', createQuote);
app.get('/favicon.ico', (req, res) => res.status(204));

  
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});




