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
const PORT = process.env.PORT || 3000; // Render will set PORT environment variable

dbConnection();
app.use(cors());
app.use(bodyParser.json());

app.use("/api", routes);
app.use("/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});

