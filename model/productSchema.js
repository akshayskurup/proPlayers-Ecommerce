const mongoose = require('mongoose')


let productSchema = mongoose.Schema({
    productName:{
        type:String,
        unique:true
    },
    productCategory:String,
    subCategory:String,
    publisher:String,
    size:String,
    totalQuantity:Number,
    description:String,
    releasedDate:Date,
    price:String,
    image:Array,
    isListed:{
        type:Boolean,
        default:true
    }
})

const product = mongoose.model('products',productSchema)

module.exports = product