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
// ✅ CORS (SAFE)
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
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Preflight fix
app.options("*", (req, res) => res.sendStatus(200));

// -----------------------------------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// -----------------------------------------------
// ✅ ✅ BEST DB CONNECTION (SERVERLESS SAFE)
// -----------------------------------------------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing");
    }

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected");
  return cached.conn;
};

// ✅ Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    return res.status(500).json({ error: "Database connection failed" });
  }
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

// ❌ NO app.listen() in Vercel
module.exports = app;