let homeController = {};
const productSchema = require('../model/productSchema');
let User = require('../model/userSchema');
let category = require('../model/categorySchema');
let offerSchema = require('../model/offerSchema')
const { query } = require('express');

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
    
        const product = await productSchema.find({ isListed: true }).populate('productCategory').sort({_id:-1}).limit(8);
        const categories = await category.find();
        console.log('user id', userId);
        console.log('home', req.session.UserLogin);

        try {
            const expiredOffers = await offerSchema.find({
                isActive: true,
                endDate: { $lte: new Date() },
            });
            for (const offer of expiredOffers) {
                offer.isActive = false;
                await offer.save();
            }
        } catch (error) {
            console.error('Error checking and expiring offers:', error);
        }

        // Render the home page
        res.render('homePage', { userId, product, categories });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

homeController.searchProducts = async (req, res) => {
    const userId = req.session.userId;
        const categories = await category.find();
    try {
        const searchQuery = req.query.query;

        if (!searchQuery) {
            // Handle the case when the search query is empty
            return res.redirect('/');
        }

        // Perform a case-insensitive search for products based on the product name
        const product = await productSchema.find({
            isListed: true,
            productName: searchQuery === ' ' 
                ? { $regex: new RegExp('.*', 'i') }  
                : { $regex: new RegExp(`^${searchQuery}`, 'i') }
        }).populate('productCategory');

        const categories = await category.find();

        // Render the search results page
        res.render('homePage', {userId, query: searchQuery, product, categories });
    } catch (error) {
        console.error('Error searching products:', error);
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
