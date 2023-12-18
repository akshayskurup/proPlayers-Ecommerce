let userProfileController = {};
let User = require("../model/userSchema");
let category = require('../model/categorySchema')
let bcrypt = require('bcrypt')
const multer = require('multer');
const path = require('path');


// Multer configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'D:/First Project/public/uploads/'); // Set the destination folder for uploaded files
//     },
//     filename: function (req, file, cb) {
//         const ext = path.extname(file.originalname);
//         cb(null, Date.now() + ext); // Rename the file to avoid conflicts
//     }
// });
const storage = multer.memoryStorage();
userProfileController.upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 50 } });


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

// userProfileController.deleteAddress = async (req, res) => {
//     const userId = req.session.userId;
//     const addressIdToDelete = req.body.addressIndex;
//     console.log("id of the address", addressIdToDelete)
  
//     try {
//         const user = await User.findById(userId);
//         const categories = await category.find()
//         const updatedUser = await User.findOneAndUpdate(
//             { _id: userId },
//             { $pull: { address: { _id: addressIdToDelete } } },
//             { new: true }
//           );
  
//       if (!updatedUser) {
//         return res.status(404).json({ error: 'Address not found' });
//       }
//        res.redirect('/user-profile?message=Successfully%20Deleted')
//       // Optionally, you can redirect or send a response based on your needs
//       //res.redirect("/user-profile"); // Redirect to the user profile page, adjust the route accordingly
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };

userProfileController.deleteAddress = async (req, res) => {
    const userId = req.session.userId;
    const addressIndexToDelete = req.body.addressIndex;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Ensure the addressIndex is within bounds
        if (addressIndexToDelete < 0 || addressIndexToDelete >= user.address.length) {
            return res.status(400).json({ success: false, error: 'Invalid address index' });
        }

        // Remove the address at the specified index
        user.address.splice(addressIndexToDelete, 1);
        await user.save();

        // Respond with success
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
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

userProfileController.uploadPhoto = async (req,res)=>{
    try {
        const imageSrc = req.body.imageSrc; // Base64-encoded cropped image data
        const croppedData = req.body.croppedData;

        console.log("req.body",req.body)
        if (croppedData) {

            const cleanedCroppedData = croppedData.replace(/^data:image\/\w+;base64,/, '');

            // Create a Buffer from the cleaned Base64 data
            const buffer = Buffer.from(cleanedCroppedData, 'base64');

            // Save the image file
            const filePath = path.join(__dirname, '..', 'public', 'uploads', 'cropped_image.jpg');
            require('fs').writeFileSync(filePath, buffer);

            console.log("Cropped image saved successfully.");
            res.json({ success: true, message: 'Cropped image data saved successfully.' });
        } else {
            console.error('croppedData is undefined.');
            res.status(400).json({ success: false, message: 'Invalid cropped data.' });
        }
    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
  
module.exports = userProfileController;
// const imageSrc = req.body.imageSrc; // Base64-encoded cropped image data
//     const croppedData = req.body.croppedData;
//     const uploadedImage = req.file;

//     // Perform any additional logic (e.g., save image data to the database)
//     console.log(" up ---imagesss",uploadedImage)
//      console.log("imagesss",req.body)
//     // Save the image file
//     console.log("croppedData",croppedData)
//     console.log("ImgData",imageSrc)

//     const cleanedCroppedData = croppedData.replace(/\s/g, '');  // Remove whitespace

// const base64WithoutPrefix = cleanedCroppedData.replace(/^data:image\/\w+;base64,/, '');
//     const buffer = Buffer.from(base64WithoutPrefix, 'base64');
//     const filePath = path.join(__dirname,'..','public', 'uploads', 'cropped_image.jpg'); // Adjust the file path as needed
//     require('fs').writeFileSync(filePath, buffer, 'base64');

//     res.json({ success: true, message: 'Cropped image data saved successfully.' });
