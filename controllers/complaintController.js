const express = require('express')
const Complaint = require('../model/complaint')


exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: category || "other",
      status: "pending",
      studentId: req.user._id.toString(),
      studentName: req.user.name,
      roomNumber: req.user.roomNumber,  
    });

    return res.status(201).json({ success: true, complaint });
  } catch (error) {
    console.error("Error creating complaint:", error.message);
    return res.status(500).json({ success: false, message: "Error creating complaint" });
  }
};



exports.getAllComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const totalComplaints = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total: totalComplaints,
        page,
        limit,
        totalPages: Math.ceil(totalComplaints / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching complaints",
    });
  }
};

exports.getStudentComplaints = async (req, res) => {
  try {
    const { studentId } = req.params;

    const complaints = await Complaint.find({ studentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Error in getStudentComplaints:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching student complaints",
    });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    
    const allowedStatuses = ["pending", "in-progress", "resolved"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        allowedStatuses,
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    
    if ((complaint.status || "").toLowerCase() === "resolved") {
      return res.status(400).json({
        success: false,
        message: "Resolved complaints cannot be modified",
      });
    }

    
    const current = complaint.status || "pending";
    const flow = ["pending", "in-progress", "resolved"];

    if (flow.indexOf(status) < flow.indexOf(current)) {
      return res.status(400).json({
        success: false,
        message: "Cannot move complaint status backwards",
      });
    }

    complaint.status = status;
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint,
    });

  } catch (error) {
    console.log("Error in updateComplaintStatus:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
    });
  }
}
exports.getComplaintByStatus = async (req,res)=>{
    try{
        const{status} = req.params;

        const allowedStatuses = ["pending", "in-progress" , "resolved"]

        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                success : false,
                message :"Invalid Status Value", 
                allowedStatuses
            })
        }

        const complaints = await Complaint.find({status}).sort({createdAt: -1})

        res.status(200).json({
            success : true,
            complaints,
        })
    }catch(error){
        console.log(error.message);
        return res.status(200).json({
            success:false,
            message:"Failed to get Complaints By Status"
        })
        
    }
}
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user._id.toString() }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get your complaints",
    });
  }
};



exports.deleteComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const complaintId = req.params.complaintId;
    const userId = req.user._id.toString();

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const statusVal = (complaint.status || "").toLowerCase();

    if (statusVal && statusVal !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Only resolved complaints can be deleted",
      });
    }

    if (complaint.studentId && complaint.studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this complaint",
      });
    }

    await complaint.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting complaint:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error deleting complaint",
    });
  }
};