const express = require("express");
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import routes and configurations
const routes = require("./src/routes/apiRoutes");
const authRouter = require("./src/routes/authRoutes");
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const { admin, bucket, auth } = require(path.resolve(__dirname, 'src/config/firebaseAdmin'));
const { createQuote } = require(path.resolve(__dirname, 'src/controllers/QuoteController'));
const { Product } = require('./src/models/Product');
const quoteRoutes = require('./src/routes/quoteRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
mongoose.connect(process.env.MONGODB_URI_PROD)
.then(() => console.log('Connected to MongoDB Production Database'))
.catch(err => console.error('MongoDB connection error:', err));

// CORS configuration
const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:5173',
  'http://localhost:5001',
  'https://quimicaindustrialpe.com',
  'https://oregonchem-backend.onrender.com',
  'https://oregonchem-dashboard.onrender.com',
  'https://quimicaindustrialpe.vercel.app',
  'https://*.onrender.com'  // Allow all Render.com subdomains
];

const corsOptions = {
  origin: (origin, callback) => {
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
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Public health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for auth verification
app.get('/api/test-auth', (req, res) => {
  res.json({
    message: 'This is a test endpoint. Use POST /auth/verify with an ID token to verify authentication.',
    example: {
      method: 'POST',
      url: '/auth/verify',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        idToken: 'your-firebase-id-token'
      }
    }
  });
});

// Routes
app.use("/api", routes);
app.use("/auth", authRouter);
app.post('/api/quotes', createQuote);
app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public/quotes', quoteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});