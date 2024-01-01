const productSchema = require('../model/productSchema');
const User = require('../model/userSchema');
const Category = require('../model/categorySchema');
const ITEMS_PER_PAGE = 8;


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
        console.log("This is category ",productCategory)
        try {
            console.log("inside try")
            const page = parseInt(req.query.page) || 1;
            const searchQuery = req.query.search || '';
            const category = await Category.findOne({ categoryName: productCategory, isListed: true });
            const categories = await Category.find();

            if (category) {
                const searchPattern = new RegExp(searchQuery, 'i');

                const totalProducts = await productSchema.countDocuments({
                    productCategory: category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                });

                const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

                // Ensure that the current page is within the valid range
                const validPage = Math.min(Math.max(page, 1), totalPages);

                const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
                const limit = ITEMS_PER_PAGE;

                const products = await productSchema.find({
                    productCategory: category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                })
                .skip(skip)
                .limit(limit);

                console.log("before rendering")
                if (req.session.UserLogin) {
                    res.render('categoryProducts', {
                        sort:"",
                        products,
                        productCategory,
                        userId,
                        categories,
                        totalPages,
                        currentPage: validPage,
                         sortDirection:"", sortField:""
                    });
                }
            } else {
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



categoryProductsController.sortProducts = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productCategory = req.params.category;
        const categories = await Category.find();
        const page = parseInt(req.query.page) || 1;
        const sortDirection = parseInt(req.params.sortDirection) || -1; // Default to descending order
        const sortField = req.query.sortField || 'price'; // Default to sorting by price
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const category = await Category.findOne({ categoryName: productCategory, isListed: true });

        if (category) {
            const totalProducts = await productSchema.countDocuments({ productCategory: category._id, isListed: true });
            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

            const product = await productSchema.find({ productCategory: category._id, isListed: true })
                .sort({ [sortField]: sortDirection })
                .populate('productCategory')
                .skip(skip)
                .limit(ITEMS_PER_PAGE);

            res.render('categoryProducts', {
                sortDirection,
                userId,
                query: "",
                products: product,
                productCategory,
                categories,
                currentPage: page,
                totalPages,
                sortField,
            });
        } else {
            console.log(`Category '${productCategory}' not listed`);
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = categoryProductsController;
