const category = require('../model/categorySchema');
const productSchema = require('../model/productSchema');

let categoryManagementController = {};

categoryManagementController.showData = async (req, res) => {
    const update = req.query.update || ""
    try {
        // Use .populate() to include product details for each category
        const categories = await category.find().populate('products');
        
        if (req.session.AdminLogin) {
            res.render('categoryManagement', { categories, message: "",update });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error fetching category data:', error);
        res.status(500).send('Internal Server Error');
    }
};

categoryManagementController.toggleListCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const categories = await category.findById(categoryId);

        if (categories) {
            // Toggle isListed value
            categories.isListed = !categories.isListed;
            await categories.save();
            res.redirect('/category-management');
        } else {
            res.status(404).send('Category not found');
        }
    } catch (error) {
        console.error('Error toggling category list status:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = categoryManagementController;
