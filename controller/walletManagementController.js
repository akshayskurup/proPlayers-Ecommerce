const walletManagementController = {}
const wallet = require("../model/walletSchema")
let User = require("../model/userSchema");
let category = require('../model/categorySchema')

walletManagementController.showData = async(req,res)=>{
    try {
        const userId = req.session.userId
        const userWallet = await wallet.findOne({userId})
        const user = await User.findById(userId);
        let categories = await category.find()
         res.render('wallet',{user,categories,userWallet})
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
   
}

module.exports = walletManagementController