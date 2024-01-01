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
    
    address:[{
        mobile:Number,
        houseName: String,
        street:String,
        city: String,
        pincode: String,
        state: String
    }
    ],
    image: {
        type: String,
        default: "user.png",
    },
    referralCode:String,
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    
    
})

const User = mongoose.model('User',userSchema);

module.exports = User;