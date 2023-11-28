const productSchema = require('../model/productSchema');
const User = require('../model/userSchema');
let category = require('../model/categorySchema');

let productPageController = {};

productPageController.showData = async (req, res) => {
    const productId = req.params.id;
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
        // Use .populate() to include category details for the product
        const product = await productSchema.findById(productId).populate('productCategory');
        const categories = await category.find();

        res.render('productPage', { product, userId, categories });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = productPageController;
