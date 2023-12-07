const productManagementController = {};
const productSchema = require('../model/productSchema');
const category = require('../model/categorySchema');
const mongoose = require('mongoose');
const multer = require('multer');
const moment = require('moment');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'D:/First Project/public/productimgs/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

 productManagementController.upload = multer({
    storage: storage,
    limits: { fieldSize: 10 * 1024 * 1024 }
});
const ITEMS_PER_PAGE = 10;
productManagementController.showData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const products = await productSchema.find().populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        const categories = await category.find();
        const totalProducts = await productSchema.countDocuments();

        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

        if (req.session.AdminLogin) {
            res.render('productManagement', { categories, products, currentPage: page, totalPages, message: "" });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

productManagementController.handleData = async (req, res) => {
    const { productName, productCategory, publisher, size, totalQuantity, description, releasedDate, price, convertedSize } = req.body;
    console.log('Request Body:', req.body);

    let categories = await category.find();
    let categoryId;

    try {
        categoryId = new mongoose.Types.ObjectId(productCategory);
    } catch (error) {
        console.error("Error converting productCategory to ObjectId:", error);
        return res.render("productManagement", { categories,currentPage: page, totalPages, message: "Error converting productCategory to ObjectId" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        console.error("Invalid ObjectId after conversion:", categoryId);
        return res.render("productManagement", { categories,currentPage: page, totalPages, message: "Invalid productCategory ObjectId" });
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
    image: [ '/' + path.relative('D:/First Project/public', req.files['gameImage'][0].path).replace(/\\/g, '/'),
    req.files['gameImage2'] ? '/' + path.relative('D:/First Project/public', req.files['gameImage2'][0].path).replace(/\\/g, '/') : null,
 ],
  });

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
}


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
          _id: { $ne: productId }, 
      });
      
      if (existingProduct) {
          return res.render("editProduct", { categories, product, message: "Product already exists", productId, formattedReleasedDate: "" });
      }


      const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
          productName,
          productCategory,
          publisher,
          size: req.body.convertedSize, // Use the converted size here
          totalQuantity,
          description,
          releasedDate,
          price,
          image: [ '/' + path.relative('D:/First Project/public', req.files['gameImage'][0].path).replace(/\\/g, '/'),
    req.files['gameImage2'] ? '/' + path.relative('D:/First Project/public', req.files['gameImage2'][0].path).replace(/\\/g, '/') : null,
 ],
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
