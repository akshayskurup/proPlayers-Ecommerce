const productManagementController = {};
const productSchema = require('../model/productSchema');
const category = require('../model/categorySchema');
const mongoose = require('mongoose');
const multer = require('multer')
const { ObjectId } = require("mongoose").Types;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'D:/First Project/public/productimgs/'); // Set your upload directory
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
    },
  });

  productManagementController.upload = multer({ 
    storage: storage,
    limits: {fieldSize: 10 * 1024 * 1024} // Adjust the size limit as needed (10 MB in this example)
     });

productManagementController.showData = async (req, res) => {
    try {
        // Use .populate() to include category details for each product
        let products = await productSchema.find().populate('productCategory');
        let categories = await category.find();

        if (req.session.AdminLogin) {
            res.render('productManagement', { categories, products, message: "" });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

productManagementController.handleData = async (req, res) => {
  const { productName, productCategory, publisher, size, totalQuantity, description, releasedDate, price, convertedSize, croppedImage1 } = req.body;
  let products = await productSchema.find();
  let categories = await category.find();
  console.log('converted size ', convertedSize)
  console.log('Original productCategory:', productCategory);
  let categoryId;
  try {
    categoryId = new mongoose.Types.ObjectId(productCategory);
  } catch (error) {
    console.error("Error converting productCategory to ObjectId:", error);
    return res.render("productManagement", { categories, products, message: "Error converting productCategory to ObjectId" });
  }

  // Check if the converted categoryId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    console.error("Invalid ObjectId after conversion:", categoryId);
    return res.render("productManagement", { categories, products, message: "Invalid productCategory ObjectId" });
  }

  console.log('req.body:', req.body);
console.log('req.file:', req.file);
console.log('req.fileSecondary:', req.fileSecondary);


  const newProduct = new productSchema({
      productName,
      productCategory: categoryId,
      publisher,
      size: req.body.convertedSize,
      totalQuantity,
      description,
      releasedDate,
      price,
      image:[croppedImage1]
  });

  const existingProduct = await productSchema.findOne({ productName });

  if (existingProduct) {
      return res.render("productManagement", { categories, products, message: "Product already exists" });
  }

console.log('newProduct before save:', newProduct);
  try {
      const savedProduct = await newProduct.save();

      // Update the category document to include the new product
      await category.findOneAndUpdate(
          { _id: categoryId },
          { $push: { products: savedProduct._id } },
          { new: true }
      );

      res.redirect('/product-management');
  } catch (err) {
      console.error("Error during product creation:", err);
      res.status(500).send('Internal Server Error');
  }
};


productManagementController.toggleListProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const products = await productSchema.findById(productId);
        if (products) {
            // Toggle isListed value
            products.isListed = !products.isListed;
            await products.save();
            res.redirect('/product-management');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error toggling product list status:', error);
        res.status(500).send('Internal Server Error');
    }
};


productManagementController.showEditForm = async (req, res) => {
  const productId = req.params.id
  const product = await productSchema.findById(productId);
  const categories = await category.find()
  const formattedReleasedDate = product.releasedDate.toISOString().split('T')[0];
  res.render('editProduct', {product, productId, categories, message: "",formattedReleasedDate })
}

productManagementController.handleEditData = async (req, res) => {
  const productId = req.params.id;
  const {
      productName, productCategory, publisher, size,convertedSize,
      totalQuantity, description, releasedDate, price
  } = req.body;

  let categories = await category.find();
  let product = await productSchema.find();

  try {

      const existingProduct = await productSchema.findOne({
          productName,
          _id: { $ne: productId }, // Exclude the current product from the check
      });
      
      if (existingProduct) {
          return res.render("editProduct", { categories, product, message: "Product already exists", productId, formattedReleasedDate: "" });
      }
      console.log("converted size= ",req.body.convertedSize)
      
      const mainImage = req.files['image'] ? "/productimgs/" + req.files['image'][0].filename : '';
const secondaryImage = req.files['imageSecondary'] ? "/productimgs/" + req.files['imageSecondary'][0].filename : '';


      const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
          productName,
          productCategory,
          publisher,
          size: req.body.convertedSize, // Use the converted size here
          totalQuantity,
          description,
          releasedDate,
          price,
          image:[mainImage,secondaryImage]
      },
      { new: true });

      if (!updatedProduct) {
          return res.status(404).send('Product not found');
      }

      res.redirect('/product-management');
  } catch (err) {
      console.error("Error during updating product:", err);
      res.status(500).send('Internal Server Error');
  }
}




module.exports = productManagementController;
