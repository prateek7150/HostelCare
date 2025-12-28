const mongoose = require('mongoose')

const complaintSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["electricity", "water", "cleanliness", "food", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },

    studentId: {
      type: String,        
      ref: "User",
      required: true,
    },
    
    studentName: {
      type: String,
      required: true,
    },
    roomNumber:{
        type:String,
        required:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
