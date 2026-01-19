const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: String,
  category: String,
  totalCost: Number,
  duration: String,
  materials: [
    {
      name: String,
      description: String
    }
  ],
  description: String,
  images: [String]
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
