const User = require('../model/userSchema')
const bcrypt = require('bcrypt')
const userManagementController = {}

userManagementController.showData = async(req,res)=>{
    
    try{
        const message = req.query.message
        const users = await User.find()
        if(req.session.AdminLogin){
            res.render('userManagement',{users,message})
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
            // Toggle the isBlocked field
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
    
            // Set isBlocked to false
            user.isBlocked = false;
            await user.save();
    
            res.redirect('/user-management');
        } catch (error) {
            console.error('Error setting isBlocked to false:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    



module.exports = userManagementController