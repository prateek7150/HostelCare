const MessFeedback = require("../model/Messfebdack");

exports.createFeedback = async (req, res) => {
  try {
    const { studentName, roomNumber, rating, comment } = req.body;

    if (!studentName || !rating) {
      return res.status(400).json({
        success: false,
        message: "Student name and rating are required",
      });
    }

    const feedback = await MessFeedback.create({
      studentName,
      roomNumber,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.log("Create feedback error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error creating feedback",
    });
  }
};


exports.getAllFeedback = async (req, res) => {
  try {
   
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const feedback = await MessFeedback.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      feedback, 
    });
  } catch (error) {
    console.log("Error in getAllFeedback:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    });
  }
};


exports.getFeedbackStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const total = await MessFeedback.countDocuments();

    if (total === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        averageRating: 0,
      });
    }

    const result = await MessFeedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating = result[0]?.avgRating || 0;

    return res.status(200).json({
      success: true,
      total,
      averageRating: Number(avgRating.toFixed(2)),
    });
  } catch (error) {
    console.log("Error in getFeedbackStats:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching feedback stats",
    });
  }
};
