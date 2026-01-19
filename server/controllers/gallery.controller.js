const Gallery = require("../models/Gallery");
const cloudinary = require("../utils/cloudinary");

const uploadGalleryImage = async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file.path);

  const image = await Gallery.create({
    publicId: result.public_id,
    category: req.body.category
  });

  res.status(201).json(image);
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

module.exports = {
  uploadGalleryImage,
  getGallery,
  deleteGalleryImage
};
