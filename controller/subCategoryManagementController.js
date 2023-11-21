const category = require('../model/categorySchema')
const subCategory = require('../model/subCategorySchema')

let subCategoryManagementController ={}

subCategoryManagementController.showData = async (req,res)=>{
    const subCategories = await subCategory.find()
    const categories = await category.find();
    res.render('subCategoryManagement',{categories,subCategories})
}


subCategoryManagementController.handleData = async (req, res) => {
    let { parentCategory, subCategoryName } = req.body;

    try {
        // Find the parent category
        const foundCategory = await category.findOne({ categoryName: parentCategory });

        if (foundCategory) {
            // Create a new subCategory with the provided values
            const newSubCategory = new subCategory({
                parentCategoryName: foundCategory.categoryName,
                subCategoryName: subCategoryName,
                // ... other fields
            });

            // Save the new subCategory
            await newSubCategory.save();

            res.redirect('/sub-category-management');
        } else {
            res.status(404).send('Parent category not found');
        }
    } catch (error) {
        console.error('Error handling sub-category creation:', error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = subCategoryManagementController