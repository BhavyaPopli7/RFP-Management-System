const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db");
const vendorRoutes = require("./routes/vendorRoutes");
const rfpRoutes = require("./routes/rfpRoutes");
const emailRoutes = require("./routes/emailRoutes");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();
app.use(cors());
app.use(express.json());
app.use("/api",vendorRoutes);
app.use("/api",rfpRoutes);
app.use("/api",emailRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
