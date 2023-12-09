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
    const { name, mobile, houseName, street, city, pincode, state } = req.body;
    const userId = req.session.userId;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    phone: mobile,
                },
                $push: {
                    address: {
                        $each: [{
                            houseName,
                            street,
                            city,
                            pincode,
                            state,
                        }],
                        $position: 0,
                    },
                },
            },
            { new: true }
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