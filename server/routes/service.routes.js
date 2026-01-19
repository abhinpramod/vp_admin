const express = require("express");
const multer = require("multer");
const adminAuth = require("../middleware/adminAuth");
const {
  createService,
  getServices,
  deleteService
} = require("../controllers/service.controller");

const router = express.Router();

// Multer config (temporary local storage)
const upload = multer({ dest: "uploads/" });

// Get all services (public / admin)
router.get("/", getServices);

// Create new service (admin only)
router.post(
  "/",
  adminAuth,
  upload.array("images"),
  createService
);

// Delete service (admin only)
router.delete(
  "/:id",
  adminAuth,
  deleteService
);

// Get single project
router.get("/:id", getServiceById);

// Update project
router.put(
  "/:id",
  adminAuth,
  upload.array("images"),
  updateService
);


module.exports = router;
