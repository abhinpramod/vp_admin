const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const galleryRoutes = require("./routes/gallery.routes");
const serviceRoutes = require("./routes/service.routes");
const statsRoutes = require("./routes/stats.routes");
const applicationRoutes = require("./routes/application.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

// -----------------------------------------------
// CORS — must come BEFORE all other middleware
// -----------------------------------------------
const ALLOWED_ORIGINS = [
  "https://admin-inky-mu-29.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,X-Requested-With"
    );
  }

  // Handle preflight OPTIONS request immediately — no auth needed
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// -----------------------------------------------
// MongoDB — serverless-safe connection caching
// -----------------------------------------------
mongoose.set("bufferCommands", false); // fail fast instead of buffering forever

let cachedConnection = null;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("WARNING: MONGO_URI is not set. DB features will not work.");
    return;
  }
  // Already connected
  if (mongoose.connection.readyState === 1) return;
  // Reuse in-progress connection promise (handles concurrent cold starts)
  if (!cachedConnection) {
    cachedConnection = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then(() => {
        console.log("MongoDB connected");
      })
      .catch((err) => {
        console.error("DB connection error:", err.message);
        cachedConnection = null; // allow retry on next request
        throw err;
      });
  }
  return cachedConnection;
};

// Ensure DB is connected before every request (critical for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: "Database unavailable", error: err.message });
  }
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/categories", categoryRoutes);

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
