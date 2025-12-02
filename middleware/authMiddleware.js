const jwt = require("jsonwebtoken");
const User = require("../model/user");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    console.log("Authorization header:", req.headers.authorization);
    console.log("Query token:", req.query.token);
    console.log("x-access-token:", req.headers["x-access-token"]);

    // 1. Prefer Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Fallback: ?token=...
    if (!token && req.query.token) {
      token = req.query.token;
    }

    // 3. Fallback: x-access-token header
    if (!token && req.headers["x-access-token"]) {
      token = req.headers["x-access-token"];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    console.log("Using token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // If you sign with { _id: user._id }
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = authMiddleware;
