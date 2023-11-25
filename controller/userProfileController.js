let userProfileController = {};
let User = require("../model/userSchema");
let category = require('../model/categorySchema')

userProfileController.showUserData = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const categories = await category.find()

        if (user) {
            // Check if the user is blocked
            if (user.isBlocked) {
                req.session.UserLogin = false; // Log out the user
                return res.redirect('/'); // Redirect to login page
            }

            console.log('User data:', user);

            if (req.session.UserLogin) {
                res.render('userProfile', { user , categories });
                console.log('USer-profile', req.session.UserLogin);
            } else {
                res.redirect('/');
            }
        } else {
            if (req.session.UserLogin) {
                res.render('userProfile', { user, error: 'User not found',categories });
            } else {
                res.redirect('/');
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = userProfileController;
