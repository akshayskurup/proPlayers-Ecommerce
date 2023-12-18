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
        console.log('user id', userId);
        console.log('home', req.session.UserLogin);
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const totalProducts = await productSchema.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const product = await productSchema.find({ isListed: true }).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);



        // Render the home page
        res.render('allProducts', { userId, product, categories,currentPage: page, totalPages });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

allproductsController.searchProducts = async (req, res) => {
    const userId = req.session.userId;
        const categories = await category.find();
        const page = parseInt(req.query.page) || 1;
        const totalProducts = await productSchema.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    try {
        const searchQuery = req.query.query;

        if (!searchQuery || searchQuery.trim()=="") {
            // Handle the case when the search query is empty
            return res.redirect('/allProducts');
        }
        // Perform a case-insensitive search for products based on the product name
        const product = await productSchema.find({
            isListed: true,
            productName: searchQuery === ' ' ? { $regex: new RegExp('.*', 'i') }  : { $regex: new RegExp(`^${searchQuery}`, 'i') }
        }).populate('productCategory');

        const categories = await category.find();

        // Render the search results page
        res.render('allProducts', {userId, query: searchQuery, product, categories,totalPages,currentPage: page });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).send('Internal Server Error');
    }
}; 

allproductsController.sortHighToLow = async(req,res)=>{
    try {
        const userId = req.session.userId
        const categories = await category.find()
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const totalProducts = await productSchema.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const product = await productSchema.find({ isListed: true}).sort({price:-1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        // Render the home page
        res.render('allProducts', { userId,query:"", product, categories,currentPage: page, totalPages });
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
}

allproductsController.sortLowToHigh = async(req,res)=>{
    try {
        const userId = req.session.userId
        const categories = await category.find()
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const totalProducts = await productSchema.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const product = await productSchema.find({ isListed: true}).sort({price:1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        // Render the home page
        res.render('allProducts', { userId,query:"", product, categories,currentPage: page, totalPages });
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = allproductsController