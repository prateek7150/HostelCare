const express = require('express')
const router = express.Router()
const{register , login} = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
router.post('/register' , register)

router.post('/login', login)


//Protected Me Route and it's verification

router.get('/me' , authMiddleware , (req,res)=>{
    res.json({
        success:true,
        user:req.user,
    })
})

module.exports = router;
