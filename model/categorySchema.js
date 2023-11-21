let mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        unique:true
    },
    isListed:{
        type: Boolean,
        default: true
    }
})


const category = mongoose.model('categories',categorySchema)
module.exports = category