const express = require('express')
const router = express.Router();

const{createFeedback , getAllFeedback , getFeedbackStats} = require('../controllers/feedbackController')

router.post('/' , createFeedback)

router.get('/' , getAllFeedback)

router.get('/stats' , getFeedbackStats)

module.exports = router;