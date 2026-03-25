const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("adminToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    maxAge: 86400000
  });

  res.json({ success: true, message: "Login successful" });
};

const adminLogout = (req, res) => {
  res.clearCookie("adminToken");
  res.json({ success: true, message: "Logged out" });
};

module.exports = { adminLogin, adminLogout };
