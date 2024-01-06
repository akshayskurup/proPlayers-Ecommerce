const mongoose = require("mongoose")

const genreSchema = new mongoose.Schema({
    genre:String,
    isListed:{
        type:Boolean,
        default:true
    }
})

const genre = mongoose.model('genre',genreSchema)

module.exports = genre