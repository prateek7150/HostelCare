const User = require('../model/user')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
  return jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};



exports.register = async (req, res) => {
  try {
    const { name, email, password, role, roomNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

   
    if (role === "student" && !roomNumber) {
      return res.status(400).json({
        success: false,
        message: "Room number is required for students",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const userData = {
      name,
      email,
      password,
      role,
    };

    if (roomNumber) {
      userData.roomNumber = roomNumber;
    }

    const user = await User.create(userData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await require("bcrypt").compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        roomNumber: user.roomNumber || null,  
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
  return res.status(500).json({
    success: false,
    message: "Server error during login"
  });
  }
};
