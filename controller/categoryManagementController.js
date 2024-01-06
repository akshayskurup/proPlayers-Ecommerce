const category = require('../model/categorySchema');
const productSchema = require('../model/productSchema');

let categoryManagementController = {};

categoryManagementController.showData = async (req, res) => {
    const update = req.query.update || ""
    try {
        const categories = await category.find().populate('products');
        
        if (req.session.AdminLogin) {
            res.render('Admin/categoryManagement', { categories, message: "",update });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error fetching category data:', error);
        res.status(500).send('Internal Server Error');
    }
};

// categoryManagementController.toggleListCategory = async (req, res) => {
//     const categoryId = req.params.id;

//     try {
//         const categories = await category.findById(categoryId);

//         const categoryProducts = categories.products
//         console.log(categoryProducts)

//         if (categories) {
//             // Toggle isListed value
//             categories.isListed = !categories.isListed;
//             await categories.save();
//             if(categoryProducts){
//                 for(const product of categoryProducts){
//                     const Product = await productSchema.findById(product);

//                     Product.isListed = !Product.isListed
//                     await Product.save()
//                 }
//             }
//             res.redirect('/category-management');
//         } else {
//             res.status(404).send('Category not found');
//         }
//     } catch (error) {
//         console.error('Error toggling category list status:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
categoryManagementController.toggleListCategory = async (req, res) => {
    const categoryId = req.params.id;
  
    try {
      const categories = await category.findById(categoryId);
  
      if (!categories) {
        return res.status(404).send('Category not found');
      }
  
      categories.isListed = !categories.isListed;
      await categories.save();
  
      const categoryProducts = categories.products;
  
      if (categoryProducts) {
        for (const product of categoryProducts) {
          const Product = await productSchema.findById(product);
  
          if (Product) {
            Product.isListed = !Product.isListed;
            await Product.save();
          }
        }
      }
  
      res.redirect('/category-management');
    } catch (error) {
      console.error('Error toggling category list status:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  

//add category 
categoryManagementController.showaddForm = (req,res)=>{
    res.render('Admin/addCategory',{message:""})
}
categoryManagementController.handledata = async(req,res)=>{
        const categoryId = req.params.id;
        const { categoryName } = req.body;
        const newCategory = new category({
            categoryName:categoryName.toUpperCase()
        });
    
        const categories = await category.find();
    
        try {
            const existingCategory = await category.findOne({ categoryName:categoryName.toUpperCase() });
    
            if (existingCategory) {
                return res.render("Admin/addCategory", { message: "Category already exists", categories });
            }
    
            const savedCategory = await newCategory.save();
            
            res.redirect('/category-management?update=Successfully%20Inserted');
        } catch (err) {
            console.error("Error during adding category:", err);
            res.status(500).send('Internal Server Error');
        }
}

//edit category
categoryManagementController.showEditData = async (req,res)=>{
    const categoryId = req.params.id
    const categoryName = await category.findById(categoryId);
    try {
        res.render('Admin/editCategory', { categoryName,message:""});
    } catch (error) {
        console.error('Error showing category:', error);
        res.status(500).send('Internal Server Error');
    }
    
}

categoryManagementController.handleEditData = async (req, res) => {
    console.log('Received form data:', req.body);
    const categoryId = req.params.id;
    const {categoryName} = req.body
    const categoryID = await category.findById(categoryId);
    console.log('Category ID:', categoryId);
    try {
        const existingCategory = await category.findOne({ categoryName:categoryName.toUpperCase() });
        if (existingCategory) {
            return res.render("Admin/editCategory", { message: "Category already exists",categoryName:categoryID});
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

module.exports = categoryManagementController;
