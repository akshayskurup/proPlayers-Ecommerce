const mongoose = require("mongoose")
const users = require('../model/userSchema')
const products = require('../model/productSchema')


const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products"
        },
        quantity:{
            type:Number,
            default:1,
            min:1
        }
    }],
})

const cart = mongoose.model('cart',cartSchema)
module.exports = cart