let mongoose = require('mongoose')


let userSchema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    password:String,
    phone:String,
    isBlocked:{
        type: Boolean,
        default: false
    },
    
    address: {
        houseName: String,
        city: String,
        pincode: String,
        state: String,
    },
})

const User = mongoose.model('User',userSchema);

module.exports = User;