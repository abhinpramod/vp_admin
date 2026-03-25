const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const galleryRoutes = require("./routes/gallery.routes");
const serviceRoutes = require("./routes/service.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

// -----------------------------------------------
// CORS — must come BEFORE all other middleware
// -----------------------------------------------
const ALLOWED_ORIGINS = [
  "https://admin-inky-mu-29.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// DB connection — wrapped so missing MONGO_URI doesn't crash the server
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("WARNING: MONGO_URI is not set. DB features will not work.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
};
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/api", (req, res) =>
  res.json({
    status: "Server is running",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    env: {
      has_mongo: !!process.env.MONGO_URI,
      has_cloudinary: !!process.env.cloud_name,
      has_jwt: !!process.env.JWT_SECRET,
    },
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
