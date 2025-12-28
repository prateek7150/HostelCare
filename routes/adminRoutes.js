const express = require('express')
const router = express.Router()

const{createWarden} = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')

router.post("/create-Warden",authMiddleware,createWarden);

module.exports = router;