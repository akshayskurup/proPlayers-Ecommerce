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

    try {
        const product = await productSchema.findById(productId).populate('productCategory');
        const categories = await category.find();
        if(req.session.UserLogin){
            res.render('User/productPage', { product, userId, categories,isItemInCart });
        }
        else{
            res.redirect('/')
        }
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
};

productPageController.addToCart = async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.id;
    const quantity = req.body.quantityValue || 1;

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
        const isProductInCart = userCart.items.some(item => item && item.productId && item.productId.equals(productId));

        if (!isProductInCart) {
            userCart.items.push({ productId,quantity });
            await userCart.save();
        }

        res.redirect(`/product-page/${productId}`);
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = productPageController;
