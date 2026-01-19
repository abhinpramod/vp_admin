const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await Admin.findOne({
      email: "admin@vpinteriors.com"
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      email: "admin@vpinteriors.com",
      password: hashedPassword
    });

    console.log("Admin seeded successfully");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
