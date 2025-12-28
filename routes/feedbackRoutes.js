const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
  getFeedbackStats
} = require("../controllers/feedbackController");

const authMiddleware = require("../middleware/authMiddleware");


router.post("/", authMiddleware, createFeedback);

router.get("/", authMiddleware, getAllFeedback);



router.get("/stats", authMiddleware, getFeedbackStats);

module.exports = router;
