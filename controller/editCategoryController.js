let editCategoryController = {}
const category = require('../model/categorySchema')


editCategoryController.showEditData = async (req,res)=>{
    const categoryId = req.params.id
    const categoryName = await category.findById(categoryId);
    res.render('editCategory', { categoryName,message:""});
}

editCategoryController.handleEditData = async (req, res) => {
    console.log('Received form data:', req.body);
    const categoryId = req.params.id;
    const {categoryName} = req.body
    const categoryID = await category.findById(categoryId);
    console.log('Category ID:', categoryId);
    try {
        const existingCategory = await category.findOne({ categoryName });
        if (existingCategory) {
            // Handle the case where the category already exists
            return res.render("editCategory", { message: "Category already exists",categoryName:categoryID});
          }
        // Use findByIdAndUpdate to find the category by ID and update its fields
        const updatedCategory = await category.findByIdAndUpdate(categoryId, req.body, { new: true });

        if (!updatedCategory) {
            // Handle the case where the category was not found
            return res.status(404).send('Category not found');
        }

        // Redirect to the appropriate page
        res.redirect('/category-management');
    } catch (error) {
        // Handle the error appropriately in your application
        console.error('Error updating category:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = editCategoryController