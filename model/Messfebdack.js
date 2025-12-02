const mongoose = require('mongoose')
const messfeedbackSchema = mongoose.Schema({
    studentName:{
        type:String,
        required:true
    },
    roomNumber:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    comment:{
        type:String,
        required:true

    }
},
    {timestamps:true}
)

const MessFeedback = mongoose.model('MessFeedback', messfeedbackSchema);

module.exports = MessFeedback;