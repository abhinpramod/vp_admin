const router = require("express").Router();
const { adminLogin, adminLogout, getMe } = require("../controllers/auth.controller");
const adminAuth = require("../middleware/adminAuth");

router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.get("/me", adminAuth, getMe);

module.exports = router;
