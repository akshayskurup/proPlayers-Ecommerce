const productManagementController = {}
const productSchema = require('../model/productSchema')
const category = require('../model/categorySchema')
const subCategorySchema = require('../model/subCategorySchema')

productManagementController.showData = async (req,res)=>{
    let categories = await category.find()
    let subCategories = await subCategorySchema.find()
    let products = await productSchema.find()
    if(req.session.AdminLogin){
      res.render('productManagement',{categories,subCategories,products,message:""})
    }
    else{
      res.redirect('/admin')
    }
}


productManagementController.handleData = async (req,res)=>{
    const {productName,productCategory,subCategory,publisher,size,totalQuantity,description,releasedDate,price,image} = req.body
    let categories = await category.find()
    const newProduct = new productSchema({
        productName,
        productCategory,
        subCategory,
        publisher,
        size,
        totalQuantity,
        description,
        releasedDate,
        price,
        image
      });
      const existingProduct = await productSchema.findOne({productName});
      let subCategories = await subCategorySchema.find()
      let products = await productSchema.find()
      if (existingProduct) {
        return res.render("productManagement", {categories,subCategories,products, message: "Product already exists"});
      }
      try {
        const savedProduct = await newProduct.save();
        res.redirect('/product-management');
      }
      catch(err){
        console.error("Error during signup:", err);
      }
}

productManagementController.toggleListProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productSchema.findById(productId);
    if (product) {
      // Toggle isListed value
      product.isListed = !product.isListed;
      await product.save();
      res.redirect('/product-management');
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error toggling product list status:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports = productManagementController