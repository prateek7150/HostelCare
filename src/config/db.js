const mongoose = require('mongoose')

const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDb Connection successful : ${conn.connection.host}/${conn.connection.name}`);
        
    }catch(error){
        console.error(`Mongodb connection failed` , error.message);
        
    }
}

module.exports = connectDB;