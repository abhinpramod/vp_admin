const Service = require("../models/Service");
const cloudinary = require("../utils/cloudinary");

const createService = async (req, res) => {
  const images = [];

  for (let file of req.files) {
    const result = await cloudinary.uploader.upload(file.path);
    images.push(result.public_id);
  }

  const service = await Service.create({
    ...req.body,
    materials: req.body.materials ? JSON.parse(req.body.materials) : [],
    images
  });

  res.status(201).json(service);
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

  service.title = req.body.title;
  service.category = req.body.category;
  service.duration = req.body.duration;
  service.description = req.body.description;
  service.materials = JSON.parse(req.body.materials);
  service.images = images;

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
