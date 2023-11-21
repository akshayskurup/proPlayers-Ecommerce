let mongoose = require('mongoose')

let subCategorySchema = new mongoose.Schema({
    parentCategoryName:String,
    subCategoryName:String,
    isListed:{
        type: Boolean,
        default: true
    },
})


const subCategory = mongoose.model('subCategories',subCategorySchema)
module.exports = subCategory