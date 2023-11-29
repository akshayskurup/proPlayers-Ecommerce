const productSchema = require('../model/productSchema');
const User = require('../model/userSchema');
let category = require('../model/categorySchema');
const cart = require('../model/cartSchema')

let productPageController = {};

productPageController.showData = async (req, res) => {
    console.log("Req params",req.params)
    const productId = req.params.id;
    const userId = req.session.userId;
    const existingitem = await cart.findOne({userId,"items.productId":productId})
    let isItemInCart = false
    if(existingitem){
        isItemInCart = true
    }
    console.log("product Id ",productId)
    console.log("is item in the cart",isItemInCart)
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

        res.render('productPage', { product, userId, categories,isItemInCart });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
};

productPageController.addToCart = async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;

    console.log("product ID: ", productId);

    if (!userId) {
        res.redirect('/');
    }

    try {
        let userCart = await cart.findOne({ userId });

        if (!userCart) {
            userCart = new cart({ userId });
            await userCart.save();
        }

        // Check if the product with the given productId is already in the items array
        const isProductInCart = userCart.items.some(item => item && item.productId && item.productId.equals(productId));

        if (!isProductInCart) {
            // Add the product to the cart's items array
            userCart.items.push({ productId });
            await userCart.save();
        }

        res.redirect(`/product-page/${productId}`);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = productPageController;
