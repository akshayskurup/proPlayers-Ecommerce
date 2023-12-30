const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    offerName:{
        type:String
    },
    discountOn:{
        type:String
    },
    discountValue:{
        type:Number
    },
    startDate:{
        type:Date
    },
    endDate:{
        type:Date
    },
    selectedCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"categories"
    },
    selectedProducts:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    },
    isActive: {
        type: Boolean,
        default: true,
    }
    

})

const offer = mongoose.model('offers',offerSchema)
module.exports = offer;