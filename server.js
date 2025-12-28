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
const adminRoutes = require('./routes/adminRoutes.js')

//error handler

// const errorHandler = require('./utils/errorHandler.js')
// const { log } = require('console')

const app = express()

const PORT = process.env.PORT || 5000

//connect to Database

connectDB()

//Initalizing global middlewares
app.use(cors({
  origin: true,
  credentials: true
}));


app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'frontend')));

app.use((req, res, next) => {
  if (req.hostname === "localhost:5000") {
    return res.redirect(`http://10.90.182.19:5000${req.originalUrl}`);
  }
  next();
});


app.set('view engine' , 'ejs')

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

//Checking the health 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

//Mounting API routes 
app.use('/api/auth' , authRoutes)

app.use('/api/complaints' , complaintRoutes)

app.use('/api/feedback' , feedbackRoutes)

app.use('/api/analytics' , analyticsRoutes)

app.use('/api/admin', adminRoutes)


//Error handler for unmatched routes
// app.use((req,res,next)=>{
//     const error = new Error('Route Not Found')
//     error.statusCode = 404
//     next(error);

// })

//Using error handler

// app.use(errorHandler)

//Starting The server
const open = require("open");



app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  if (process.env.NODE_ENV !== "production") {
    const open = (await import("open")).default;
    open(`http://localhost:${PORT}`);
  }
});
