const express = require('express')
const router = express.Router()

const {
  createComplaint,
  getAllComplaints,
  getStudentComplaints,
  updateComplaintStatus,
  getComplaintByStatus,
  getMyComplaints
} = require('../controllers/complaintController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createComplaint);
router.get('/', getAllComplaints);


router.get('/my', authMiddleware, getMyComplaints);

router.get('/student/:studentId', getStudentComplaints);
router.patch('/:complaintId/status', updateComplaintStatus);
router.get('/status/:status', getComplaintByStatus);

module.exports = router;
