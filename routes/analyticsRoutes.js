const express = require('express');
const router = express.Router();

const {
    getComplaintsSummary,   
    getComplaintByCategory
} = require('../controllers/analyticsController');

router.get('/summary', getComplaintsSummary);
router.get('/by-category', getComplaintByCategory);

module.exports = router;