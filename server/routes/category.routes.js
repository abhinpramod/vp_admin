const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const router = express.Router();

// Get all categories (public/admin)
router.get("/", getCategories);

// Protected routes (admin only)
router.post("/", adminAuth, createCategory);
router.put("/:id", adminAuth, updateCategory);
router.delete("/:id", adminAuth, deleteCategory);

module.exports = router;
