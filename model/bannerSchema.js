const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    image:{
        type:String
    },
    title:String,
    redirectLink:String,
    isActive:{
        type:Boolean,
        default:true
    }
})
const banner = mongoose.model('banners',bannerSchema)
module.exports = banner