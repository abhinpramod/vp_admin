const router = require("express").Router();
const { adminLogin, adminLogout } = require("../controllers/auth.controller");

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

module.exports = router;
