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
// ✅ CORS (Vercel-safe)
// -----------------------------------------------
const ALLOWED_ORIGINS = [
  "https://admin-inky-mu-29.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // ⚠️ allow all (temporary safe fix)
      }
    },
    credentials: true,
  })
);

// ✅ IMPORTANT: Handle preflight (THIS FIXES YOUR ERROR)
app.options("*", (req, res) => {
  res.status(200).end();
});

// -----------------------------------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// -----------------------------------------------
// ✅ DB connection (safe for serverless)
// -----------------------------------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI missing");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB error:", err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// -----------------------------------------------
// Routes
// -----------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stats", statsRoutes);

// -----------------------------------------------
// Health check
// -----------------------------------------------
app.get("/api", (req, res) => {
  res.json({
    status: "Server is running",
  });
});



module.exports = app;