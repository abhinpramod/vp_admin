const Gallery = require("../models/Gallery");
const cloudinary = require("../utils/cloudinary");

const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload buffer directly to Cloudinary (no disk write needed)
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const isPublished = req.body.isPublished !== undefined ? (req.body.isPublished === 'true' || req.body.isPublished === true) : true;

    const image = await Gallery.create({
      publicId: result.public_id,
      category: req.body.category,
      isPublished
    });

    res.status(201).json(image);
  } catch (error) {
    console.error("GALLERY UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getGallery = async (req, res) => {
  res.json(await Gallery.find().sort({ createdAt: -1 }));
};

const deleteGalleryImage = async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  await cloudinary.uploader.destroy(image.publicId);
  await image.deleteOne();
  res.json({ message: "Deleted" });
};

const updateGalleryImage = async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (req.body.category) image.category = req.body.category;
  if (req.body.isPublished !== undefined) {
    image.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
  }
  await image.save();
  res.json(image);
};

module.exports = {
  uploadGalleryImage,
  getGallery,
  deleteGalleryImage,
  updateGalleryImage
};
