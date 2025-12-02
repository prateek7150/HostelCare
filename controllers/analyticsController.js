const Complaint = require('../model/complaint');

exports.getComplaintsSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const inProgress = await Complaint.countDocuments({ status: 'in-progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });

    return res.status(200).json({
      success: true,
      summary: { total, pending, inProgress, resolved }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Summary-Wise Complaints"
    });
  }
};

exports.getComplaintByCategory = async (req, res) => {
  try {
    const result = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      categories: result
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed To Get Complaints By Category"
    });
  }
};