const category = require('../model/categorySchema')

let categoryManagementController = {}


categoryManagementController.showData = async (req,res)=>{
    const categories = await category.find()
    res.render('categoryManagement',{categories,message:""})
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
            // Handle the case where the category already exists
            return res.render("categoryManagement", { message: "Category already exists",categories});
          }
        const savedCategory = await newCategory.save()

        res.redirect('/category-management')
    }
    catch(err){
        console.error("Error during adding category:", err);
      }
}




module.exports = categoryManagementController