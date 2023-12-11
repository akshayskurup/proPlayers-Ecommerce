let userEditProfileController = {}
const { findById } = require("../model/categorySchema");
let User = require("../model/userSchema");
let category = require('../model/categorySchema')

userEditProfileController.showData = async (req,res)=>{
    try{
        const categories = await category.find()
        const userId = req.session.userId
        const user = await User.findById(userId)
        if (user) {
            console.log('User data:', user);
            res.render('userEditProfile', { user,categories});
        } else{
            res.render('userEditProfile', { user,error: 'User not found',categories });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
    
}

userEditProfileController.handleUserData = async (req, res) => {
    const { name, mobile, houseName, street, city, pincode, state } = req.body;
    const userId = req.session.userId;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    phone: mobile,
                    'address.0.houseName': houseName,
                    'address.0.street': street,
                    'address.0.city': city,
                    'address.0.pincode': pincode,
                    'address.0.state': state,
                },
            }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect("/user-profile");
    } catch (err) {
        console.error("Error during updating user data:", err);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = userEditProfileController