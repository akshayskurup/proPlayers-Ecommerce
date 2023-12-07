let addCategoryController = {}
let category = require ('../model/categorySchema')

addCategoryController.showaddForm = (req,res)=>{
    res.render('addCategory',{message:""})
}
addCategoryController.handledata = async(req,res)=>{
        const categoryId = req.params.id;
        const { categoryName } = req.body;
        const newCategory = new category({
            categoryName:categoryName.toUpperCase()
        });
    
        const categories = await category.find();
    
        try {
            const existingCategory = await category.findOne({ categoryName:categoryName.toUpperCase() });
    
            if (existingCategory) {
                return res.render("addCategory", { message: "Category already exists", categories });
            }
    
            const savedCategory = await newCategory.save();
            
            res.redirect('/category-management');
        } catch (err) {
            console.error("Error during adding category:", err);
            res.status(500).send('Internal Server Error');
        }
}
module.exports = addCategoryController