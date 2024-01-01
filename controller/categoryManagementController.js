const category = require('../model/categorySchema');
const productSchema = require('../model/productSchema');

let categoryManagementController = {};

categoryManagementController.showData = async (req, res) => {
    const update = req.query.update || ""
    try {
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

        const categoryProducts = categories.products
        console.log(categoryProducts)

        if (categories) {
            // Toggle isListed value
            categories.isListed = !categories.isListed;
            await categories.save();
            if(categoryProducts){
                for(const product of categoryProducts){
                    const Product = await productSchema.findById(product);

                    Product.isListed = !Product.isListed
                    await Product.save()
                }
            }
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
