const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 

const userSchema = new Schema({
    firstname:{type:String, required:true},
    lastname:{type:String, required:true},
    password:{type: String, required: true, minlength:6},
    email:{type:String, required:true, unique:true},
    places:[{type: mongoose.Types.ObjectId, required:true, ref: 'Place'}],
      image: { type: String },
       isVerified: { type: Boolean, default: false },
       verificationToken: { type: String }, // store unique code
        verificationExpires: { type: Date }// expiry date for the code


})



module.exports = mongoose.model('User', userSchema)