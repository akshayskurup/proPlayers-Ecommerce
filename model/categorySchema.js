let mongoose = require('mongoose')
const products = require('../model/productSchema')
let categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        unique:true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
    }],
    isListed:{
        type: Boolean,
        default: true
    }
})


const category = mongoose.model('categories',categorySchema)
module.exports = category