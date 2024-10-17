const express = require("express");
const dbConnection = require("./src/config/config");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./src/routes/apiRoutes");
const authRouter = require("./src/routes/authRoutes");
const bodyParser = require("body-parser");

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;

dbConnection();

app.use(cors());
app.use(bodyParser.json({ type: "application/json; charset=utf-8" }));
app.use(express.json());
app.use(
    express.text({ type: "application/x-www-form-urlencoded", limit: "10mb" })
);
app.use(express.static("public"));

app.use("/", routes);
app.use("/auth", authRouter);

app.use((err, req, res, next) => {
    console.error("Error stack:", err.stack);
    res.status(err.status || 500).send(err.message || "Something broke!");
});

app.listen(PORT, () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
});