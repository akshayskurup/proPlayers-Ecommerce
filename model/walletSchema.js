let mongoose = require('mongoose')

let walletSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    balance:{
        type:Number,
        default:0
    },
    transactionHistory:[
        {
            transaction:{
                type:String,
                enum:["Money Added","Money Deducted"]
            },
            amount:{
                type:Number
            }
        }
    ]
})

const wallet = mongoose.model('wallet',walletSchema)

module.exports = wallet