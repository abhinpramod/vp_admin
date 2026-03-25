const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const { getStats } = require("../controllers/stats.controller");

const router = express.Router();

router.get("/", adminAuth, getStats);

module.exports = router;
