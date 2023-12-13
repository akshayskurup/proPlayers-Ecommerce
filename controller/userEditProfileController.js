const userEditProfileController = {};
const User = require('../model/userSchema');
const category = require('../model/categorySchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'D:/First Project/public/cropped-images/'); // Specify the directory where the cropped images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

userEditProfileController.upload = multer({ storage: storage });

userEditProfileController.showData = async (req, res) => {
    try {
        const categories = await category.find();
        const userId = req.session.userId;
        const user = await User.findById(userId);
        if (user) {
            console.log('User data:', user);
            res.render('userEditProfile', { user, categories });
        } else {
            res.render('userEditProfile', { user, error: 'User not found', categories });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
};

userEditProfileController.handleUserData = async (req, res) => {
    const { name, mobile, houseName, street, city, pincode, state } = req.body;
    const userId = req.session.userId;

    try {
        // Access the cropped image file from req.file
        const croppedImageData = req.file;

        // Check if there's a cropped image file
        if (!croppedImageData) {
            return res.status(400).send('Cropped image data not provided');
        }

        // Specify the directory where the cropped images will be stored
        const destinationPath = 'D:/First Project/public/cropped-images/';
        const fileFormat = croppedImageData.mimetype.split('/')[1];
        const filename = `${userId}-${Date.now()}.${fileFormat}`;
        const imagePath = path.join(destinationPath, filename);

        // Move the cropped image file to the destination directory
        fs.renameSync(croppedImageData.path, imagePath);

        // Update the database with the cropped image path
        const finalImagePath = `/${path.relative('D:/First Project/public', imagePath).replace(/\\/g, '/')}`;
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

module.exports = userEditProfileController;
