const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    discountType:{
        type:String,
        enum: ['Minimum Purchase','First Purchase'],
        required:true
    },
    expiry: {
        type: Date,
        required: true,
    },
    minimumCartAmount: {
        type: Number,
        required: true,
    },
    status:{
        type:String,
        enum:['Active','Expired','Not Active']
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isExpired:{
        type:Boolean,
        default:false
    }
})

const coupon = mongoose.model('coupon', couponSchema);

module.exports = coupon;