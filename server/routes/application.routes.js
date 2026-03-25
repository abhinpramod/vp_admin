const router = require("express").Router();
const adminAuth = require("../middleware/adminAuth");
const ctrl = require("../controllers/application.controller");

router.get("/", adminAuth, ctrl.getApplications);
router.post("/", ctrl.createApplication); // public: from contact form
router.put("/:id", adminAuth, ctrl.updateApplication);
router.delete("/:id", adminAuth, ctrl.deleteApplication);

module.exports = router;
