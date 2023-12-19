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
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
productManagementController.upload = multer({ storage: storage });
const ITEMS_PER_PAGE = 10;
productManagementController.showData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const updateMess=req.query.update||""

        const products = await productSchema.find().sort({_id:-1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        const categories = await category.find();
        const totalProducts = await productSchema.countDocuments();

        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

        if (req.session.AdminLogin) {
            res.render('productManagement', { categories, products, currentPage: page, totalPages, message: "",updateMess });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

productManagementController.searchProducts = async (req, res) => {
  const userId = req.session.userId;
  try {
      const searchQuery = req.query.query;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const updateMess=req.query.update||""

      const products = await productSchema.find().populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
      const categories = await category.find();
      const totalProducts = await productSchema.countDocuments();

      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);


      if (!searchQuery || searchQuery.trim()=="") {
          return res.redirect('/product-management');
      }
      const product = await productSchema.find({
          isListed: true,
          productName: searchQuery === ' ' ? { $regex: new RegExp('.*', 'i') }  : { $regex: new RegExp(`^${searchQuery}`, 'i') }
      }).populate('productCategory');
      res.render('productManagement', { categories, products:product, currentPage: page, totalPages, message: "",updateMess });

  } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).send('Internal Server Error');
  }
}; 




productManagementController.handleData = async (req, res) => {
    const { productName, productCategory, publisher, size, totalQuantity, description, releasedDate, price, convertedSize } = req.body;
    console.log('Request Body:', req.body);
    const capitalizedProductName = productName.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
        return char.toUpperCase();
      });
      const ITEMS_PER_PAGE = 10;
    let categories = await category.find();
    let categoryId;
    const files = req.files;
    const imagePaths = files.map((file) => '/productimgs/' + file.filename);
    const updateMess=req.query.update||""

    try {
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const totalProducts = await productSchema.countDocuments();
      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
      const products = await productSchema.find().sort({_id:-1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);

        categoryId = new mongoose.Types.ObjectId(productCategory);
    

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        console.error("Invalid ObjectId after conversion:", categoryId);
    }

    let existingProduct = await productSchema.find({
        $or: [
          { productName: capitalizedProductName },
          { productName: capitalizedProductName.trim() },
        ],
      });
      
      if (existingProduct.length > 0) {
        console.log('Product with the same name already exists.');
        return res.render("productManagement", { products,categories,currentPage: page, totalPages, message: "Product Name already exists", updateMess:"" });

      } else {
        const newProduct = new productSchema({
            productName:capitalizedProductName,
            productCategory: categoryId,
            publisher,
            size: req.body.convertedSize,
            totalQuantity,
            description,
            releasedDate,
            price,
            image: imagePaths 
          });
    const savedProduct = await newProduct.save();
    await category.findOneAndUpdate(
      { _id: categoryId },
      { $push: { products: savedProduct._id } },
      { new: true }
    );

    res.redirect('/product-management?update=Successfully%20Inserted%20Product');
  }
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
    productName,
    productCategory,
    publisher,
    size,
    convertedSize,
    totalQuantity,
    description,
    releasedDate,
    price,
  } = req.body;

  let categories = await category.find();
  let product = await productSchema.findById(productId);

  const capitalizedProductName = productName
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, function (char) {
      return char.toUpperCase();
    });

  try {
    const existingProduct = await productSchema.findOne({
      $or: [
        { productName: capitalizedProductName },
        { productName: capitalizedProductName.trim() },
      ],
    });

    if (existingProduct && existingProduct._id != productId) {

      return res.render("editProduct", {
        categories,
        product,
        message: "Product name already exists",
        productId,
        formattedReleasedDate: "",
      });
    }

    let newImagePaths = [];
    const files = req.files;

    if (files && files.length > 0) {

      newImagePaths = files.map((file) => '/productimgs/' + file.filename);
    } else {
      newImagePaths = product.image || [];
    }

    const updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      {
        productName: capitalizedProductName,
        productCategory,
        publisher,
        size: req.body.convertedSize,
        totalQuantity,
        description,
        releasedDate,
        price,
        image: newImagePaths,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }

    res.redirect('/product-management?update=Successfully%20Edited%20Product');
  } catch (err) {
    console.error("Error during updating product:", err);
    res.status(500).send('Internal Server Error');
  }
};





module.exports = productManagementController;
