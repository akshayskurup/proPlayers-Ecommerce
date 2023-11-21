let userEditProfileController = {}
let User = require("../model/userSchema");

userEditProfileController.showData = async (req,res)=>{
    try{
        const userId = req.session.userId
        const user = await User.findById(userId)
        if (user) {
            console.log('User data:', user);
            res.render('userEditProfile', { user });
        } else{
            res.render('userEditProfile', { user,error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
    
}




module.exports = userEditProfileController