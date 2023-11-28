let userEditProfileController = {}
const { findById } = require("../model/categorySchema");
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

userEditProfileController.handleUserData = async (req, res) => {
    const { name, phone, houseName, street, city, pincode, state } = req.body;
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).render('userEditProfile', { user, error: 'User not found' });
        }

        user.name = name;
        user.phone = phone;
        user.address.houseName = houseName;
        user.address.street = street;
        user.address.city = city;
        user.address.pincode = pincode;
        user.address.state = state;

        const updatedUser = await user.save();

        if (!updatedUser) {
            return res.status(404).send('Product not found');
        }

        res.redirect(`/user-profile/${userId}`);
    } catch (err) {
        console.error("Error during updating user data:", err);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = userEditProfileController