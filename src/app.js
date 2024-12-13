const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/database");
require("dotenv").config();

const indexRouter = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB.connectDB();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
