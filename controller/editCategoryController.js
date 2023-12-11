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
        const existingCategory = await category.findOne({ categoryName:categoryName.toUpperCase() });
        if (existingCategory) {
            return res.render("editCategory", { message: "Category already exists",categoryName:categoryID});
          }
        const updatedCategory = await category.findByIdAndUpdate(categoryId,{ categoryName:categoryName.toUpperCase()}, { new: true });

        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }
        res.redirect('/category-management?update=Successfully%20Updated');
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = editCategoryController