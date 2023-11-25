const category = require('../model/categorySchema')

let categoryManagementController = {}


categoryManagementController.showData = async (req,res)=>{
    const categories = await category.find()
    if(req.session.AdminLogin){
      res.render('categoryManagement',{categories,message:""})
    }
    else{
      res.redirect('/admin')
    }
}

categoryManagementController.handleData = async (req,res)=>{
    const categoryId = req.params.id;
    const {categoryName}=req.body
    const newCategory = new category({
        categoryName
    })
    const categoryID = await category.findById(categoryId);
    
    const categories = await category.find()
    try{
        const existingCategory = await category.findOne({ categoryName });
        if (existingCategory) {
            return res.render("categoryManagement", { message: "Category already exists",categories});
          }
        const savedCategory = await newCategory.save()

        res.redirect('/category-management')
    }
    catch(err){
        console.error("Error during adding category:", err);
      }
}


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
        res.status(404).send('category not found');
      }
    } catch (error) {
      console.error('Error toggling category list status:', error);
      res.status(500).send('Internal Server Error');
    }
  };




module.exports = categoryManagementController