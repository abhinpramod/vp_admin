const Service = require("../models/Service");
const Gallery = require("../models/Gallery");

const getStats = async (req, res) => {
  try {
    const totalProjects = await Service.countDocuments();
    const totalGalleryItems = await Gallery.countDocuments();
    
    // Optionally add logic to calculate total revenue from services
    const services = await Service.find();
    const totalRevenue = services.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    res.status(200).json({
      totalProjects,
      totalGalleryItems,
      revenue: totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(2)}L` : "₹0",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

module.exports = { getStats };
