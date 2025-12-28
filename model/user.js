const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
   
    },
    roomNumber:{
      type:String,
      required:function(){
        return this.role ==="student";
      },
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'warden'],
      default: 'student', 
    },
  },
  { timestamps: true }
);

// Password Hashing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
