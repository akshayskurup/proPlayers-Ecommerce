let homeController = {};
const productSchema = require('../model/productSchema');
let User = require('../model/userSchema');
let category = require('../model/categorySchema');
let offerSchema = require('../model/offerSchema')
let banner = require('../model/bannerSchema')
let offer = require('../model/offerSchema')
const wallet = require("../model/walletSchema")

const { query } = require('express'); 
const ITEMS_PER_PAGE = 8;

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
        const product = await productSchema.find({ isListed: true }).populate('productCategory').sort({_id:-1}).limit(8);
        const categories = await category.find();
        const banners = await banner.find()
        const offers = await offer.find()

        console.log('user id', userId);
        console.log('home', req.session.UserLogin);

        res.render('User/homePage', { userId, product, categories, banners, offers });
    } catch (error) {
        console.error('Error fetching data:', error);
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

//wallet
homeController.showWallet = async(req,res)=>{
    try {
        const userId = req.session.userId
        const userWallet = await wallet.findOne({userId})
        const user = await User.findById(userId);
        let categories = await category.find()
         res.render('User/wallet',{user,categories,userWallet})
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
   
}




//category Products



homeController.showData = async (req, res) => {
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
            const Category = await category.findOne({ categoryName: productCategory, isListed: true });
            const categories = await category.find();
            const sortDirection = req.query.sortDirection || ""

            if (Category) {
                const searchPattern = new RegExp(`^${searchQuery.trim()}`, 'i');

                const totalProducts = await productSchema.countDocuments({
                    productCategory: Category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                });

                const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

                const validPage = Math.min(Math.max(page, 1), totalPages);

                const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
                const limit = ITEMS_PER_PAGE;

                const products = await productSchema.find({
                    productCategory: Category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                })
                .skip(skip)
                .limit(limit);

                console.log("before rendering")
                if (req.session.UserLogin) {
                    res.render('User/categoryProducts', {
                        sort:"",
                        products,
                        productCategory,
                        userId,
                        categories,
                        totalPages,
                        currentPage: validPage,
                         sortDirection, 
                         sortField:"",
                         searchQuery
                    });
                }
            } else {
                console.log(`Category '${productCategory}' not listed`);
                res.redirect('/'); 
            }
        } catch (error) {
            console.error('Error in categoryProductsController:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
};
homeController.searchCategoryProducts = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productCategory = req.params.category;

        if (userId && req.session.UserLogin) {
            const user = await User.findById(userId);
            if (user && user.isBlocked) {
                req.session.UserLogin = false;
                return res.redirect('/');
            }

            const page = parseInt(req.query.page) || 1;
            const searchQuery = req.query.search || '';
            const Category = await category.findOne({ categoryName: productCategory, isListed: true });
            const categories = await category.find();

            if (Category) {
                const searchPattern = new RegExp(`^${searchQuery.trim()}`, 'i');

                const totalProducts = await productSchema.countDocuments({
                    productCategory: Category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                });

                const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

                const validPage = Math.min(Math.max(page, 1), totalPages);

                const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
                const limit = ITEMS_PER_PAGE;

                const products = await productSchema.find({
                    productCategory: Category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                })
                .skip(skip)
                .limit(limit);

                if (req.session.UserLogin) {
                    res.render('User/categoryProducts', {
                        sort: "",
                        products,
                        productCategory,
                        userId,
                        categories,
                        totalPages,
                        currentPage: validPage,
                        sortDirection: "",
                        sortField: "",
                        searchQuery,
                    });
                }
            } else {
                console.log(`Category '${productCategory}' not listed`);
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in searchCategoryProducts:', error);
        res.status(500).send('Internal Server Error');
    }
};


homeController.sortProducts = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productCategory = req.params.category;
        const categories = await category.find();
        const page = parseInt(req.query.page) || 1;
        const sortDirection = parseInt(req.params.sortDirection) || -1; 
        const sortField = req.query.sortField || 'price'; 
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const Category = await category.findOne({ categoryName: productCategory, isListed: true });

        if (Category) {
            const totalProducts = await productSchema.countDocuments({ productCategory: Category._id, isListed: true });
            const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

            const product = await productSchema.find({ productCategory: Category._id, isListed: true })
                .sort({ [sortField]: sortDirection })
                .populate('productCategory')
                .skip(skip)
                .limit(ITEMS_PER_PAGE);

            res.render('User/categoryProducts', {
                sortDirection,
                userId,
                query: "",
                products: product,
                productCategory,
                categories,
                currentPage: page,
                totalPages,
                sortField,
                searchQuery
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

homeController.searchAndSortCategoryProducts = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productCategory = req.params.category;

        if (userId && req.session.UserLogin) {
            const user = await User.findById(userId);
            if (user && user.isBlocked) {
                req.session.UserLogin = false;
                return res.redirect('/');
            }

            const page = parseInt(req.query.page) || 1;
            const searchQuery = req.query.search || '';
            const Category = await category.findOne({ categoryName: productCategory, isListed: true });
            const categories = await category.find();

            if (Category) {
                const searchPattern = new RegExp(`^${searchQuery.trim()}`, 'i');

                const totalProducts = await productSchema.countDocuments({
                    productCategory: Category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                });

                const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

                const validPage = Math.min(Math.max(page, 1), totalPages);

                const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
                const limit = ITEMS_PER_PAGE;

                // Sorting parameters
                const sortDirection = parseInt(req.params.sortDirection) || -1;
                const sortField = req.query.sortField || 'price';

                // Sorting logic
                const sortedProducts = await productSchema.find({
                    productCategory: Category._id,
                    isListed: true,
                    productName: { $regex: searchPattern },
                })
                .sort({ [sortField]: sortDirection })
                .skip(skip)
                .limit(limit);

                if (req.session.UserLogin) {
                    res.render('User/categoryProducts', {
                        sort: "",
                        products: sortedProducts,
                        productCategory,
                        userId,
                        categories,
                        totalPages,
                        currentPage: validPage,
                        sortDirection,
                        sortField,
                        searchQuery,
                    });
                }
            } else {
                console.log(`Category '${productCategory}' not listed`);
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in searchAndSortCategoryProducts:', error);
        res.status(500).send('Internal Server Error');
    }
};





//All Products


// homeController.showProducts = async (req, res) => {
//     const userId = req.session.userId;

//     if (!req.session.UserLogin || !userId) {
//         return res.redirect('/');
//     }

//     const user = await User.findById(userId);
//     if (user && user.isBlocked) {
//         req.session.UserLogin = false;
//         return res.redirect('/');
//     }

//     try {
//         const categories = await category.find();

//         const page = parseInt(req.query.page) || 1;
//         const searchQuery = req.query.search || '';
//         const totalProducts = await productSchema.countDocuments({
//             isListed: true,
//             productName: { $regex: new RegExp(searchQuery, 'i') },
            
//         });
//         const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//         const validPage = Math.min(Math.max(page, 1), totalPages);

//         const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
//         const limit = ITEMS_PER_PAGE;

        

//         const products = await productSchema
//             .find({ isListed: true, productName: { $regex: new RegExp(searchQuery, 'i') } })
//             .populate('productCategory')
//             .skip(skip)
//             .limit(limit);

//         res.render('User/allProducts', { userId, product:products, categories, currentPage: validPage, totalPages, searchQuery,sortOrder: '' });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
// homeController.searchProducts = async (req, res) => {
//     console.log("search")
//     const userId = req.session.userId;
//     const searchQuery = req.query.query;
//         const categories = await category.find();
//         const page = parseInt(req.query.page) || 1;
//         const totalProducts = await productSchema.countDocuments({
//             isListed: true,
//             productName: { $regex: new RegExp(searchQuery, 'i') },
            
//         });
//         const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//         const validPage = Math.min(Math.max(page, 1), totalPages);

//         const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
//         const limit = ITEMS_PER_PAGE;
//     try {
        

//         if (!searchQuery || searchQuery.trim()=="") {
//             return res.redirect('/allProducts');
//         }
//         const product = await productSchema.find({
//             isListed: true,
//             productName: searchQuery === ' ' ? { $regex: new RegExp('.*', 'i') }  : { $regex: new RegExp(`^${searchQuery}`, 'i') }
//         }).populate('productCategory').skip(skip).limit(limit);

//         const categories = await category.find();

//         res.render('User/allProducts', {userId, query: searchQuery, product, categories,totalPages,currentPage: validPage,sortOrder: '' });
//     } catch (error) {
//         console.error('Error searching products:', error);
//         res.status(500).send('Internal Server Error');
//     }
// }; 
// homeController.sortHighToLow = async (req, res) => {
//     try {
//         console.log("inside hight to low")
//         const userId = req.session.userId;
//         const categories = await category.find();

//         const page = parseInt(req.query.page) || 1;
//         const totalProducts = await productSchema.countDocuments({
//             isListed: true
//         });
//         const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//         const validPage = Math.min(Math.max(page, 1), totalPages);

//         const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
//         const limit = ITEMS_PER_PAGE;
//         console.log("Before find");
//         const product = await productSchema
//             .find({ isListed: true })
//             .sort({ price: -1 })
//             .populate('productCategory')
//             .skip(skip)
//             .limit(limit);
//             console.log("before render");
//         res.render('User/allProducts', { userId, query: "", product, categories, totalPages, currentPage: validPage,sortOrder: 'highToLow' });
//     } catch (error) {
//         console.error('Error during sort products:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
// homeController.sortLowToHigh = async (req, res) => {
//     try {
//         const userId = req.session.userId;
//         const categories = await category.find();

//         const page = parseInt(req.query.page) || 1;
//         const totalProducts = await productSchema.countDocuments({
//             isListed: true
//         });
//         const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//         const validPage = Math.min(Math.max(page, 1), totalPages);

//         const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
//         const limit = ITEMS_PER_PAGE;

//         const product = await productSchema
//             .find({ isListed: true })
//             .sort({ price: 1 })
//             .populate('productCategory')
//             .skip(skip)
//             .limit(limit);

//         res.render('User/allProducts', { userId, query: "", product, categories, totalPages, currentPage: validPage,sortOrder: 'lowToHigh' });
//     } catch (error) {
//         console.error('Error during sort products:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };

homeController.showProducts = async (req, res) => {
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

        res.render('User/allProducts', { userId, product: products, categories, currentPage: validPage, totalPages, query: searchQuery, sortOrder: '' });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

homeController.searchProducts = async (req, res) => {
    const userId = req.session.userId;
    const searchQuery = req.query.query;

    try {
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

        if (!searchQuery || searchQuery.trim() == "") {
            return res.redirect('/allProducts');
        }
        const product = await productSchema.find({
            isListed: true,
            productName: searchQuery === ' ' ? { $regex: new RegExp('.*', 'i') } : { $regex: new RegExp(`^${searchQuery}`, 'i') }
        }).populate('productCategory').skip(skip).limit(limit);

        res.render('User/allProducts', { userId, query: searchQuery, product, categories, totalPages, currentPage: validPage, sortOrder: '' });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

homeController.searchAndSortProducts = async (req, res) => {
    const userId = req.session.userId;
    const searchQuery = req.query.query;

    try {
        const categories = await category.find();
        const page = parseInt(req.query.page) || 1;
        const totalProducts = await productSchema.countDocuments({
            isListed: true,
            productName: { $regex: new RegExp(`^${searchQuery}`, 'i') },
        });
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const validPage = Math.min(Math.max(page, 1), totalPages);

        const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
        const limit = ITEMS_PER_PAGE;

        const sortOrder = req.params.sortOrder || 'default';

        const product = await productSchema
            .find({ isListed: true, productName: { $regex: new RegExp(`^${searchQuery}`, 'i') } })
            .populate('productCategory')
            .sort(sortOrder === 'highToLow' ? { price: -1 } : sortOrder === 'lowToHigh' ? { price: 1 } : {})
            .skip(skip)
            .limit(limit);

        res.render('User/allProducts', { userId, query: searchQuery, product, categories, totalPages, currentPage: validPage, sortOrder: sortOrder });
    } catch (error) {
        console.error('Error searching and sorting products:', error);
        res.status(500).send('Internal Server Error');
    }
};

homeController.sortHighToLow = async (req, res) => {
    try {
        const userId = req.session.userId;
        const categories = await category.find();

        const page = parseInt(req.query.page) || 1;
        const totalProducts = await productSchema.countDocuments({
            isListed: true
        });
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const validPage = Math.min(Math.max(page, 1), totalPages);

        const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
        const limit = ITEMS_PER_PAGE;

        const product = await productSchema
            .find({ isListed: true })
            .sort({ price: -1 })
            .populate('productCategory')
            .skip(skip)
            .limit(limit);

        res.render('User/allProducts', { userId, query: "", product, categories, totalPages, currentPage: validPage, sortOrder: 'highToLow' });
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
};

homeController.sortLowToHigh = async (req, res) => {
    try {
        const userId = req.session.userId;
        const categories = await category.find();

        const page = parseInt(req.query.page) || 1;
        const totalProducts = await productSchema.countDocuments({
            isListed: true
        });
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        const validPage = Math.min(Math.max(page, 1), totalPages);

        const skip = Math.max((validPage - 1) * ITEMS_PER_PAGE, 0);
        const limit = ITEMS_PER_PAGE;

        const product = await productSchema
            .find({ isListed: true })
            .sort({ price: 1 })
            .populate('productCategory')
            .skip(skip)
            .limit(limit);

        res.render('User/allProducts', { userId, query: "", product, categories, totalPages, currentPage: validPage, sortOrder: 'lowToHigh' });
    } catch (error) {
        console.error('Error during sort products:', error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = homeController;
