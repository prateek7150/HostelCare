const User = require("../model/user");

exports.createWarden = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const warden = await User.create({
      name,
      email,
      password,
      role: "warden",
    });

    res.status(201).json({
      success: true,
      message: "Warden created successfully",
      warden: {
        _id: warden._id,
        name: warden.name,
        email: warden.email,
      },
    });
  } catch (error) {
  console.error("Create warden error:", error);
  res.status(500).json({
    success: false,
    message: error.message || "Error creating warden",
  });
}

};
