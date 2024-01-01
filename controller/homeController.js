let homeController = {};
const productSchema = require('../model/productSchema');
let User = require('../model/userSchema');
let category = require('../model/categorySchema');
let offerSchema = require('../model/offerSchema')
let banner = require('../model/bannerSchema')
let offer = require('../model/offerSchema')
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
        const expiredOffers = await offer.find({
            isActive: true,
            endDate: { $lte: new Date() },
        });

        console.log('expiredOffers', expiredOffers);

        for (const offer of expiredOffers) {
            offer.isActive = false;
            await offer.save();

            if (offer.discountOn === 'category' && offer.selectedCategory) {
                const categoryId = offer.selectedCategory;
                const productsInCategory = await productSchema.find({ productCategory: categoryId });

                for (const product of productsInCategory) {
                    product.price = product.originalPrice;
                    product.originalPrice = 0;
                    product.discount = 0;
                    await product.save();
                }
            } else if (offer.discountOn === 'product' && offer.selectedProducts) {
                const productId = offer.selectedProducts;
                const product = await productSchema.findOne({ _id: productId });

                product.price = product.originalPrice;
                product.originalPrice = 0;
                product.discount = 0;
                await product.save();
            }
        }
    } catch (error) {
        console.error('Error checking and expiring offers:', error);
    }

    try {
        // Now that the offer prices have been updated, fetch other data and render the home page
        const product = await productSchema.find({ isListed: true }).populate('productCategory').sort({_id:-1}).limit(8);
        const categories = await category.find();
        const banners = await banner.find()
        const offers = await offer.find()

        console.log('user id', userId);
        console.log('home', req.session.UserLogin);

        // Render the home page
        res.render('homePage', { userId, product, categories, banners, offers });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};


// homeController.searchProducts = async (req, res) => {
//     const userId = req.session.userId;
//         const categories = await category.find();
//     try {
//         const searchQuery = req.query.query;

//         if (!searchQuery) {
//             // Handle the case when the search query is empty
//             return res.redirect('/');
//         }

//         // Perform a case-insensitive search for products based on the product name
//         const product = await productSchema.find({
//             isListed: true,
//             productName: searchQuery === ' ' 
//                 ? { $regex: new RegExp('.*', 'i') }  
//                 : { $regex: new RegExp(`^${searchQuery}`, 'i') }
//         }).populate('productCategory');

//         const categories = await category.find();

//         // Render the search results page
//         res.render('homePage', {userId, query: searchQuery, product, categories });
//     } catch (error) {
//         console.error('Error searching products:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };

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
