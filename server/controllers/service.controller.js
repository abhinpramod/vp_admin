const Service = require("../models/Service");
const cloudinary = require("../utils/cloudinary");

const createService = async (req, res) => {
  try {
    const images = [];

    if (req.files) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.public_id);
      }
    }

    const service = await Service.create({
      ...req.body,
      materials: req.body.materials ? JSON.parse(req.body.materials) : [],
      images
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServices = async (req, res) => {
  res.json(await Service.find().sort({ createdAt: -1 }));
};

const deleteService = async (req, res) => {
  const service = await Service.findById(req.params.id);

  for (let img of service.images) {
    await cloudinary.uploader.destroy(img);
  }

  await service.deleteOne();
  res.json({ message: "Deleted" });
};

const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.id);
  res.json(service);
};

const updateService = async (req, res) => {
  const service = await Service.findById(req.params.id);

  let images = service.images;

  if (req.files && req.files.length > 0) {
    images = [];
    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      images.push(result.public_id);
    }
  }

  if (req.body.title) service.title = req.body.title;
  if (req.body.category) service.category = req.body.category;
  if (req.body.duration) service.duration = req.body.duration;
  if (req.body.description) service.description = req.body.description;
  if (req.body.materials) service.materials = JSON.parse(req.body.materials);
  service.images = images;

  if (req.body.isPublished !== undefined) {
    service.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
  }

  await service.save();
  res.json(service);
};




module.exports = {
  createService,
  getServices,
  deleteService,
  getServiceById,
  updateService
  
};
