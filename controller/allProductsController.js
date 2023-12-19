let allproductsController = {}
const productSchema = require('../model/productSchema');
const User = require('../model/userSchema');
const category = require('../model/categorySchema');
const ITEMS_PER_PAGE = 8;


allproductsController.showProducts = async (req, res) => {
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
        const categories = await category.find();

        const page = parseInt(req.query.page) || 1;
        const searchQuery = req.query.search || '';
        const totalProducts = await productSchema.countDocuments({
            isListed: true,
            productName: { $regex: new RegExp(searchQuery, 'i') },
            
        });
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const validPage = Math.min(Math.max(page, 1), totalPages);

        const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
        const limit = ITEMS_PER_PAGE;

        const products = await productSchema
            .find({ isListed: true, productName: { $regex: new RegExp(searchQuery, 'i') } })
            .populate('productCategory')
            .skip(skip)
            .limit(limit);

        // Render the home page
        res.render('allProducts', { userId, product:products, categories, currentPage: validPage, totalPages, searchQuery });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};


allproductsController.searchProducts = async (req, res) => {
    const userId = req.session.userId;
    const searchQuery = req.query.query;
        const categories = await category.find();
        const page = parseInt(req.query.page) || 1;
        const totalProducts = await productSchema.countDocuments({
            isListed: true,
            productName: { $regex: new RegExp(searchQuery, 'i') },
            
        });
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const validPage = Math.min(Math.max(page, 1), totalPages);

        const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
        const limit = ITEMS_PER_PAGE;
    try {
        

        if (!searchQuery || searchQuery.trim()=="") {
            return res.redirect('/allProducts');
        }
        const product = await productSchema.find({
            isListed: true,
            productName: searchQuery === ' ' ? { $regex: new RegExp('.*', 'i') }  : { $regex: new RegExp(`^${searchQuery}`, 'i') }
        }).populate('productCategory').skip(skip).limit(limit);

        const categories = await category.find();

        res.render('allProducts', {userId, query: searchQuery, product, categories,totalPages,currentPage: validPage, });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).send('Internal Server Error');
    }
}; 

allproductsController.sortHighToLow = async (req, res) => {
    try {
        const userId = req.session.userId;
        const categories = await category.find();
        const product = await productSchema
            .find({ isListed: true })
            .sort({ price: -1 })
            .populate('productCategory');

        // Render the home page
        res.render('allProducts', { totalPages:"",userId, query: "", product, categories });
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
};

allproductsController.sortLowToHigh = async (req, res) => {
    try {
        const userId = req.session.userId;
        const categories = await category.find();
        const product = await productSchema
            .find({ isListed: true })
            .sort({ price: 1 })
            .populate('productCategory');

        // Render the home page
        res.render('allProducts', {totalPages:"", userId, query: "", product, categories });
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = allproductsController