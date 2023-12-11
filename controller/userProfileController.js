let userProfileController = {};
let User = require("../model/userSchema");
let category = require('../model/categorySchema')
let bcrypt = require('bcrypt')

userProfileController.showUserData = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const categories = await category.find()
        const message = req.query.message || '';

        if (user) {

            if (req.session.UserLogin) {
                res.render('userProfile', { user , categories,error:"",message});
                console.log('USer-profile', req.session.UserLogin);
            } else {
                res.redirect('/');
            }
        } else {
            if (req.session.UserLogin) {
                res.render('userProfile', { user, error: 'User not found',categories, message:""});
            } else {
                res.redirect('/');
            }
        }
    } catch (error) {
            console.error('Error fetching user data:', error);
            res.status(500).send('Internal Server Error');
    }
};
userProfileController.addAddress = async(req,res)=>{
    const categories = await category.find()
    res.render('userAddAddress',{categories})
}

userProfileController.handleAddAddress = async (req,res)=>{
    const { mobile, houseName, street, city, pincode, state } = req.body;
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const categories = await category.find()
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    address: {
                        mobile,
                        houseName,
                        street,
                        city,
                        pincode,
                        state,
                    },
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect('/user-profile?message=Successfully%20Inserted');
    } catch (err) {
        console.error('Error during adding address:', err);
        res.status(500).send('Internal Server Error');
    }
}
userProfileController.editAddress = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex } = req.body;
    console.log("addressIndex",addressIndex)

    try {
        const user = await User.findById(userId);
        const categories = await category.find()
        const userAddressToEdit = user.address[addressIndex];
        res.render('userEditAddress', { user, userAddressToEdit, addressIndex, categories});
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
};
userProfileController.UpdateAddress = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex,mobile, houseName, street, city, pincode, state } = req.body;
    console.log("addressIndex",addressIndex)

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    [`address.${addressIndex}.mobile`]: mobile,
                    [`address.${addressIndex}.houseName`]: houseName,
                    [`address.${addressIndex}.street`]: street,
                    [`address.${addressIndex}.city`]: city,
                    [`address.${addressIndex}.pincode`]: pincode,
                    [`address.${addressIndex}.state`]: state
                    
                },
            },
            { new: true }
        );

        
        res.redirect("/user-profile?message=Successfully%20Edited%20Address");
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Internal Server Error');
    }
}

userProfileController.deleteAddress = async (req, res) => {
    const userId = req.session.userId;
    const addressIdToDelete = req.body.addressIndex;
    console.log("id of the address", addressIdToDelete)
  
    try {
        const user = await User.findById(userId);
        const categories = await category.find()
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { address: { _id: addressIdToDelete } } },
            { new: true }
          );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'Address not found' });
      }
       res.redirect('/user-profile?message=Successfully%20Deleted')
      // Optionally, you can redirect or send a response based on your needs
      //res.redirect("/user-profile"); // Redirect to the user profile page, adjust the route accordingly
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  userProfileController.showChangePassword = async(req,res)=>{
    const categories = await category.find()
    res.render("changePassword",{message:"",categories})
  }
  userProfileController.handleChangePassword = async(req,res)=>{
    try {
        const {currentPassword,newPassword,confirmPassword}=req.body
        const categories = await category.find()
    const userId = req.session.userId
    const user = await User.findById(userId)
    let password = await bcrypt.compare(currentPassword,user.password)
    if(password){
        if(newPassword===confirmPassword){
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
            res.redirect('/user-profile?message=Successfully%20Changed Password'); 
        }
        else{
            res.render("changePassword",{message:"Entered password is not matching",categories})
        }
    }else{
        res.render("changePassword",{message:"Current password is wrong",categories})
    }
    } catch (error) {
        
    }
    
  }
  
module.exports = userProfileController;
