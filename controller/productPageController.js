const productSchema = require('../model/productSchema');
const User = require('../model/userSchema');
let category = require('../model/categorySchema')

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
    const product = await productSchema.findById(productId);
    const categories = await category.find()
    console.log('product', product);

    res.render('productPage', { product, userId ,categories});
};

module.exports = productPageController;
