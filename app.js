const express = require("express");
const path = require('path');
const dbConnection = require(path.resolve(__dirname, 'src/config/config'));
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./src/routes/apiRoutes");
const authRouter = require("./src/routes/authRoutes");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
dbConnection();

// CORS options
const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);
app.use("/auth", authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});

