let homeController = {}
const productSchema = require('../model/productSchema')
let User = require('../model/userSchema')
let category = require('../model/categorySchema')

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
    const products = await productSchema.find({ isListed: true });
    const categories = await category.find()
    console.log('id', userId);
    console.log('home', req.session.UserLogin);

    // Render the home page
    res.render('homePage', { userId, product: products , categories});
}

homeController.logOut = (req, res) => {
    req.session.UserLogin = false;
    console.log("Log out successfully");
    res.redirect('/');
    console.log(req.session.UserLogin);
}

homeController.redirectToCategory = (req, res) => {
    const selectedCategory = req.params.category;
    res.redirect(`/products/${selectedCategory}`);
};

module.exports = homeController;
