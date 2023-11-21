let mongoose = require("mongoose")

let adminSchema = new mongoose.Schema({
    email:String,
    password:String
})

const admin = mongoose.model('admins',adminSchema)

module.exports = admin