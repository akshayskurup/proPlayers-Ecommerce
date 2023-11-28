const productManagementController = {};
const productSchema = require('../model/productSchema');
const category = require('../model/categorySchema');
const mongoose = require('mongoose');
const { ObjectId } = require("mongoose").Types;


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
  const { productName, productCategory, publisher, size, totalQuantity, description, releasedDate, price, image, convertedSize} = req.body;
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
  const newProduct = new productSchema({
      productName,
      productCategory: categoryId,
      publisher,
      size: req.body.convertedSize,
      totalQuantity,
      description,
      releasedDate,
      price,
      image
  });

  const existingProduct = await productSchema.findOne({ productName });

  if (existingProduct) {
      return res.render("productManagement", { categories, products, message: "Product already exists" });
  }

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

module.exports = productManagementController;
