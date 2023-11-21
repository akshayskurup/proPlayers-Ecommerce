let userProfileController = {}
let User = require("../model/userSchema");

userProfileController.showUserData = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        
        if (user) {
            console.log('User data:', user);
            
            if(req.session.UserLogin){
                res.render('userProfile', { user });
                console.log('USer-profile',req.session.UserLogin)
            }
            else{
                res.redirect('/')
            }
        
        } else{
            if(req.session.UserLogin){
                res.render('userProfile', { user,error: 'User not found' });
            }
            else{
                res.redirect('/')
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = userProfileController