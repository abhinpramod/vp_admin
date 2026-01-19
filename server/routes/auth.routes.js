const router = require("express").Router();
const { adminLogin } = require("../controllers/auth.controller");

router.post("/login", adminLogin);

module.exports = router;
