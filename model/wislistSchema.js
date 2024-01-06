const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    userID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
        },
    items :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    }]
})

const wishlist = mongoose.model('wislist',wishlistSchema)
module.exports = wishlist