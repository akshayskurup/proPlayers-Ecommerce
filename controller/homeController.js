let homeController = {};
const productSchema = require('../model/productSchema');
let User = require('../model/userSchema');
let category = require('../model/categorySchema');

homeController.showHome = async (req, res) => {
    const userId = req.session.userId;

    if (!req.session.UserLogin || !userId) {
        return res.redirect('/');
    }
    
    const user = await User.findById(userId);
    if (user && user.isBlocked) {
        req.session.UserLogin = false; 
        return res.redirect('/'); 
    }

    try {
    
        const product = await productSchema.find({ isListed: true }).populate('productCategory');
        const categories = await category.find();
        console.log('user id', userId);
        console.log('home', req.session.UserLogin);

        // Render the home page
        res.render('homePage', { userId, product, categories });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

homeController.logOut = (req, res) => {
    req.session.UserLogin = false;
    console.log("Log out successfully");
    res.redirect('/');
    console.log(req.session.UserLogin);
};

homeController.redirectToCategory = (req, res) => {
    const selectedCategory = req.params.category;
    res.redirect(`/products/${selectedCategory}`);
};

module.exports = homeController;
