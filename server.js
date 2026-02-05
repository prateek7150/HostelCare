require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./src/config/db.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const complaintRoutes = require("./routes/complaintRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: "https://YOUR-VERCEL-FRONTEND-URL",
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}


app.get("/", (req, res) => {
  res.status(200).json({ message: "Hostel Care API is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
