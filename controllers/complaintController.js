const express = require('express')
const Complaint = require('../model/complaint')
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      studentId: req.user._id.toString()  // 👈 taken from token, not request body
    });

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Error Generating The Complaint" });
  }
};


exports.getAllComplaints = async(req,res)=>{
    try{
        const complaints = await Complaint.find();

        res.json({success:true , complaints})
    }catch(error){
        res.status(500).json({message :'Error Fetching Complaints'})
    }
}
exports.getStudentComplaints = async(req, res)=>{
    try{
        const{studentId} = req.params;

        const complaints = await Complaint.find({studentId}).sort({createdAt : -1})

        if(!complaints.length){
            return res.status(404).json({
                success : false,
                message :'No complaint of this student'
            })
        }

        return res.status(200).json({
            success:true,
            complaints
        })
    }catch(error){
        console.log(error.message);

        res.status(500).json({message : 'Failed To Get Students Complaint'})
        
    }
}
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

    complaint.status = status;
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    console.log("Error in updateComplaintStatus:", error.message);

    // Only send response if not already sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to update complaint status",
      });
    }
  }
};
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
