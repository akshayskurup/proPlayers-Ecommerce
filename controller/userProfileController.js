let userProfileController = {};
let User = require("../model/userSchema");
let category = require('../model/categorySchema')
let bcrypt = require('bcrypt')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const serverPath = path.resolve(__dirname, '..'); // Adjust the number of '..' based on your project structure

        const destinationPath = path.join(serverPath, 'public', 'cropped-images');

        cb(null, destinationPath);

    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

userProfileController.upload = multer({ storage: storage });


userProfileController.showUserData = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const categories = await category.find()
        const message = req.query.message || '';

        if (user) {

            if (req.session.UserLogin) {
                res.render('User/userProfile', { user , categories,error:"",message});
                console.log('USer-profile', req.session.UserLogin);
            } else {
                res.redirect('/');
            }
        } else {
            if (req.session.UserLogin) {
                res.render('User/userProfile', { user, error: 'User not found',categories, message:""});
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
    res.render('User/userAddAddress',{categories})
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
        res.render('User/userEditAddress', { user, userAddressToEdit, addressIndex, categories});
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
    const addressIndexToDelete = req.body.addressIndex;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (addressIndexToDelete < 0 || addressIndexToDelete >= user.address.length) {
            return res.status(400).json({ success: false, error: 'Invalid address index' });
        }

        user.address.splice(addressIndexToDelete, 1);
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};



  userProfileController.showChangePassword = async(req,res)=>{
    const categories = await category.find()
    res.render("User/changePassword",{message:"",categories})
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
            res.render("User/changePassword",{message:"Entered password is not matching",categories})
        }
    }else{
        res.render("User/changePassword",{message:"Current password is wrong",categories})
    }
    } catch (error) {
        
    }
    
  }

//edit profile

userProfileController.showData = async (req, res) => {
    try {
        const categories = await category.find();
        const userId = req.session.userId;
        const user = await User.findById(userId);
        if (user) {
            console.log('User data:', user);
            res.render('User/userEditProfile', { user, categories });
        } else {
            res.render('User/userEditProfile', { user, error: 'User not found', categories });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
};

userProfileController.handleUserData = async (req, res) => {
    const { name, mobile, houseName, street, city, pincode, state } = req.body;
    const userId = req.session.userId;

    try {
        const croppedImageData = req.file;
        const serverPath = path.resolve(__dirname, '..'); // Adjust the number of '..' based on your project structure
        const destinationPath = path.join(serverPath, 'public', 'cropped-images');

       
        let finalImagePath;

        if (croppedImageData) {
            const fileFormat = croppedImageData.mimetype.split('/')[1];
            const filename = `${userId}-${Date.now()}.${fileFormat}`;
            const imagePath = path.join(destinationPath, filename);


            fs.renameSync(croppedImageData.path, imagePath);

            finalImagePath = `/${path.relative(path.join(serverPath, 'public'), imagePath).replace(/\\/g, '/')}`;


            console.log("final image ",finalImagePath)


        } else {
            const existingUser = await User.findById(userId);
            finalImagePath = existingUser.image;
        }

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
                    image: finalImagePath,
                },
            }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect('/user-profile');
    } catch (err) {
        console.error('Error during updating user data:', err);
        res.status(500).send('Internal Server Error');
    }
};

  
module.exports = userProfileController;
