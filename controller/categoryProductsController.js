const productSchema = require('../model/productSchema');
const User = require('../model/userSchema');
const Category = require('../model/categorySchema');

let categoryProductsController = {};

categoryProductsController.showData = async (req, res) => {
    const productCategory = req.params.category;
    const userId = req.session.userId;

    if (userId && req.session.UserLogin) {
        const user = await User.findById(userId);
        if (user && user.isBlocked) {
            req.session.UserLogin = false;
            return res.redirect('/');
        }

        try {
            // Check if the category is listed
            const category = await Category.findOne({ categoryName: productCategory, isListed: true });

            if (category) {
                const products = await productSchema.find({ productCategory: category._id, isListed: true });
                console.log('Filtered Products:', products);
                res.render('categoryProducts', { products, productCategory, userId });
            } else {
                // If the category is not listed, you might want to handle this case (e.g., display a message)
                console.log(`Category '${productCategory}' not listed`);
                res.redirect('/'); // Update the redirect path as needed
            }
        } catch (error) {
            console.error('Error in categoryProductsController:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
};

module.exports = categoryProductsController;
