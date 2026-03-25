const router = require("express").Router();
const multer = require("multer");
const adminAuth = require("../middleware/adminAuth");
const controller = require("../controllers/gallery.controller");

const upload = multer({ dest: "uploads/" });

router.get("/", controller.getGallery);
router.post("/", adminAuth, upload.single("image"), controller.uploadGalleryImage);
router.put("/:id", adminAuth, controller.updateGalleryImage);
router.delete("/:id", adminAuth, controller.deleteGalleryImage);

module.exports = router;
