const mongoose = require('mongoose')
const categories = require('../model/categorySchema')


let productSchema = mongoose.Schema({
    productName:{
        type:String,
        unique:true
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    publisher:String,
    size:String,
    totalQuantity:{
        type:Number,
        min:0
    },
    description:String,
    releasedDate:Date,
    originalPrice:Number,
    price:Number,
    image: [{
        type: String,
    }],
    isListed:{
        type:Boolean,
        default:true
    },
    discount: {
        type: Number,
        default: 0
      },
})

const product = mongoose.model('products',productSchema)

module.exports = product