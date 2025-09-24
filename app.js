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

// const analyticsRoutes = require('./src/routes/analyticsRoutes'); // Temporarily disabled due to Firebase config issues
const aiImageRoutes = require('./src/routes/aiImageRoutes');
const { admin, mainApp, analyticsApp } = require(path.resolve(__dirname, 'src/config/firebaseAdminInit'));
const { createQuote } = require(path.resolve(__dirname, 'src/controllers/QuoteController'));
const { Product } = require('./src/models/Product');
const quoteRoutes = require('./src/routes/quoteRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Log environment
console.log('Starting server with environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', process.env.MONGODB_URI_PROD ? 'Set' : 'Not set');
console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');

// Database connection
mongoose.connect(process.env.MONGODB_URI_PROD)
.then(() => console.log('Connected to MongoDB Production Database'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if database connection fails
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:5173',
  'http://localhost:5001',
  'http://localhost:10000',
  'http://192.168.0.22:4321', // Your machine's IP for iPhone access
  'http://192.168.0.22:5001', // Your machine's IP for backend
  'https://quimicaindustrialpe.com',
  'https://www.quimicaindustrialpe.com',
  'https://quimica.pe',
  'https://www.quimica.pe',
  'https://oregonchem-backend.onrender.com',
  'https://oregonchem-dashboard.onrender.com',
  'https://quimicaindustrialpe.vercel.app',
  'https://*.onrender.com',  // Allow all Render.com subdomains
  'http://localhost:3000',
  'https://oregonchem.tech',
  'https://www.oregonchem.tech',
  'https://*.github.io',  // Allow all GitHub Pages domains
  'https://ggmj92.github.io'  // Specific GitHub Pages domain
];

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Log the incoming request origin
    console.log('Incoming request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    // Special handling for dashboard domain
    if (origin === 'https://oregonchem-dashboard.onrender.com') {
      console.log('Allowing request from dashboard');
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard domains
        const regex = new RegExp('^' + allowedOrigin.replace('*', '.*') + '$');
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      console.log('Allowing request from:', origin);
      return callback(null, true);
    }
    
    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: allowing all origins');
      return callback(null, true);
    }
    
    console.log('Blocking request from:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Middleware - Configure body parser with larger limits for base64 images
app.use(bodyParser.json({ 
  limit: '50mb',
  type: 'application/json'
}));
app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: '50mb',
  type: 'application/x-www-form-urlencoded'
}));
app.use(bodyParser.text({ 
  limit: '50mb',
  type: 'text/plain'
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Public health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('Health check requested from origin:', req.headers.origin);
    
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Firebase Admin SDK
    let firebaseStatus = 'disconnected';
    try {
      await mainApp.auth().listUsers(1);
      firebaseStatus = 'connected';
    } catch (error) {
      console.error('Firebase connection check failed:', error);
    }

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        firebase: firebaseStatus
      },
      environment: {
        node_env: process.env.NODE_ENV,
        port: process.env.PORT,
        cors_origins: allowedOrigins
      }
    };

    console.log('Health check response:', response);
    res.json(response);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for auth verification
app.get('/api/test-auth', (req, res) => {
  console.log('Auth test endpoint requested');
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
// app.use('/api/analytics', analyticsRoutes); // Temporarily disabled due to Firebase config issues
app.use('/api/public/quotes', quoteRoutes);
app.use('/api/ai-images', aiImageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://192.168.0.22:${PORT}`);
  console.log('Environment variables check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- PORT:', PORT);
  console.log('- MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'Set' : 'Not set');
  console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
});