const User = require('../model/userSchema')
const bcrypt = require('bcrypt')
const userManagementController = {}

userManagementController.showData = async(req,res)=>{
    
    try{
        const message = req.query.message
        let users;

        if (req.query.search) {
            const trimmedSearch = req.query.search.trim();
            users = await User.find({ name: { $regex: new RegExp(trimmedSearch, 'i') } });        
        }if (req.query.sort === 'latest') {
            users = await User.find().sort({ _id: -1 });
        } else if (req.query.sort === 'older') {
            users = await User.find().sort({ _id: 1 });
        } else {
            users = await User.find();
        }if(req.session.AdminLogin){
            res.render('userManagement',{users,message,req})
        }else{
            res.redirect('/')
        }
    }
    catch(err){
        res.status(500).send("Server Error")
    }
}
      userManagementController.blockUser = async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send('User not found');
            }
            user.isBlocked = !user.isBlocked || false;
            await user.save();
    
            res.redirect('/user-management');
        } catch (error) {
            console.error('Error toggling user block status:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
    userManagementController.unblockUser = async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
    
            user.isBlocked = false;
            await user.save();
    
            res.redirect('/user-management');
        } catch (error) {
            console.error('Error setting isBlocked to false:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    



module.exports = userManagementController