const category = require('../model/categorySchema');
const subCategory = require('../model/subCategorySchema');

let subCategoryManagementController = {};

subCategoryManagementController.showData = async (req, res) => {
    const subCategories = await subCategory.find();
    const categories = await category.find();
    if(req.session.AdminLogin){
        res.render('subCategoryManagement', { categories, subCategories, message:"" });
    }else{
        res.redirect('/admin')
    }
};

subCategoryManagementController.handleData = async (req, res) => {
    let { parentCategory, subCategoryName } = req.body;

    try {
        // Find the parent category
        const foundCategory = await category.findOne({ categoryName: parentCategory });

        if (foundCategory) {
            // Check if the subcategory already exists for the specified parent category
            const existingSubCategory = await subCategory.findOne({
                parentCategoryName: foundCategory.categoryName,
                subCategoryName: subCategoryName,
            });

            if (existingSubCategory) {
                // Handle the case where the subcategory already exists for the parent category
                return res.render('subCategoryManagement', {
                    message: 'Subcategory already exists for the selected parent category',
                    categories: await category.find(),
                    subCategories: await subCategory.find(),
                });
            }

            // Create a new subCategory with the provided values
            const newSubCategory = new subCategory({
                parentCategoryName: foundCategory.categoryName,
                subCategoryName: subCategoryName,
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


subCategoryManagementController.editData = async (req,res)=>{
    let subCategoryId = req.params.id
    let categories = await category.find()
    let SubCategory = await subCategory.findById(subCategoryId)
    res.render('editSubCategory',{categories,message:"",SubCategory,subCategoryId})
}
subCategoryManagementController.saveEditData = async (req, res) => {
    let subCategoryId = req.params.id;
    const { parentCategory, subCategoryName } = req.body;

    // Check if the entered subcategory name is unique within its parent category
    const isUniqueEnteredValue = await subCategory.findOne({
        parentCategory: parentCategory,
        subCategoryName: subCategoryName
    });

    if (isUniqueEnteredValue && isUniqueEnteredValue._id.toString() !== subCategoryId) {
        // If not unique, render the editSubCategory page with an error message
        let categories = await category.find();
        let SubCategory = await subCategory.findById(subCategoryId);
        return res.render('editSubCategory', { categories, message: 'Subcategory name must be unique within its parent category', SubCategory, subCategoryId });
    }

    // Check if the subcategory name is unique within its parent category excluding the current subcategory
    const isUnique = await subCategory.findOne({
        _id: { $ne: subCategoryId }, // Exclude the current subcategory from the check
        parentCategory: parentCategory,
        subCategoryName: subCategoryName
    });

    if (isUnique) {
        // If not unique, render the editSubCategory page with an error message
        let categories = await category.find();
        let SubCategory = await subCategory.findById(subCategoryId);
        return res.render('editSubCategory', { categories, message: 'Subcategory name must be unique within its parent category', SubCategory, subCategoryId });
    }

    // If the name is unique, proceed with updating the subcategory
    let updatedSubCategory = await subCategory.findByIdAndUpdate(subCategoryId,{ parentCategoryName: req.body.parentCategory, subCategoryName: req.body.subCategoryName }, { new: true });

    if (!updatedSubCategory) {
        return res.status(404).send('Error in updating');
    }

    res.redirect('/sub-category-management');
}

subCategoryManagementController.toggleListSubCategory = async(req,res)=>{
    const subCategoryId = req.params.id;
    try {
      const subCategories = await subCategory.findById(subCategoryId);
      if (subCategories) {
        // Toggle isListed value
        subCategories.isListed = !subCategories.isListed;
        await subCategories.save();
        res.redirect('/sub-category-management');
      } else {
        res.status(404).send('category not found');
      }
    } catch (error) {
      console.error('Error toggling category list status:', error);
      res.status(500).send('Internal Server Error');
    }
}

module.exports = subCategoryManagementController;
