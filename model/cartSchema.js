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
        }
    }],
})

const cart = mongoose.model('cart',cartSchema)
module.exports = cart