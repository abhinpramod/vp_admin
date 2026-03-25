const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Gallery", gallerySchema);
