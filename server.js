require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser=require('cookie-parser')
const path = require('path')

const connectDB = require('./src/config/db.js')


//Routes
const authRoutes = require('./routes/authRoutes.js')
const complaintRoutes = require('./routes/complaintRoutes.js')
const feedbackRoutes = require('./routes/feedbackRoutes.js')
const analyticsRoutes = require('./routes/analyticsRoutes.js')

//error handler

// const errorHandler = require('./utils/errorHandler.js')
// const { log } = require('console')

const app = express()

const PORT = process.env.PORT || 5000

//connect to Database

connectDB()

//Initalizing global middlewares
app.use(cors({origin:process.env.CLIENT_URL || '*' , credentials :true}))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

app.set('view engine' , 'ejs')

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

//Checking the health 
app.get('/' , (req,res)=>{
    res.json({message : 'Hostel Care API is running !'})
})
//Mounting API routes 
app.use('/api/auth' , authRoutes)

app.use('/api/complaints' , complaintRoutes)

app.use('/api/feedback' , feedbackRoutes)

app.use('/api/analytics' , analyticsRoutes)

//Error handler for unmatched routes
// app.use((req,res,next)=>{
//     const error = new Error('Route Not Found')
//     error.statusCode = 404
//     next(error);

// })

//Using error handler

// app.use(errorHandler)

//Starting The server

app.listen(PORT , ()=>{
    console.log(`Server is live on Port ${PORT}`);
    
})