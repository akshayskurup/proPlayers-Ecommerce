const productManagementController = {};
const productSchema = require('../model/productSchema');
const category = require('../model/categorySchema');
const mongoose = require('mongoose');
const multer = require('multer');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const genres = require('../model/genreSchema')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // cb(null, 'D:/First Project/public/productimgs/');
      const serverPath = path.resolve(__dirname, '..'); // Adjust the number of '..' based on your project structure

        const destinationPath = path.join(serverPath, 'public', 'productimgs');

        cb(null, destinationPath);
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
        const genre = await genres.find()
        let products

         products = await productSchema.find().sort({_id:-1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        const categories = await category.find();
        const totalProducts = await productSchema.countDocuments();

        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        if(req.query.sort==="latest"){
           products = await productSchema.find().sort({_id:-1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        }else if(req.query.sort ==="older"){
          
             products = await productSchema.find().sort({_id:1}).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);
        }
        if (req.session.AdminLogin) {
            res.render('Admin/productManagement', { categories,genre, products, currentPage: page, totalPages, message: "",updateMess,req });
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
      const genre = await genres.find()

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
      res.render('Admin/productManagement', { categories,genre, products:product, currentPage: page, totalPages, message: "",updateMess,req });

  } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).send('Internal Server Error');
  }
}; 






productManagementController.handleData = async (req, res) => {
  const { productName, productCategory, productGenre, publisher, size, totalQuantity, description, releasedDate, price, convertedSize } = req.body;
  console.log('Request Body:', req.body);
  const capitalizedProductName = productName.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
      return char.toUpperCase();
  });
  const ITEMS_PER_PAGE = 10;
  let categories = await category.find();
  let categoryId;
  const files = req.files;
  const imagePaths = files.map((file) => '/productimgs/' + file.filename);
  const updateMess = req.query.update || "";
  const genre = await genres.find()

  try {
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const totalProducts = await productSchema.countDocuments();
      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
      const products = await productSchema.find().sort({ _id: -1 }).populate('productCategory').skip(skip).limit(ITEMS_PER_PAGE);

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
          return res.render("Admin/productManagement", { products,genre, categories, currentPage: page, totalPages, message: "Product Name already exists", updateMess: "", req });

      } else {
          while (imagePaths.length < 4) {
              imagePaths.push("");
          }

          const newProduct = new productSchema({
              productName: capitalizedProductName,
              productCategory: categoryId,
              publisher,
              size: req.body.convertedSize,
              totalQuantity,
              description,
              releasedDate,
              price,
              image: imagePaths
          });
          if (productCategory === '657fc26292aaf07d17328e08') {
            newProduct.productGenre = productGenre;
        }

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
  let genre = await genres.find()
  const formattedReleasedDate = product.releasedDate.toISOString().split('T')[0];
  res.render('Admin/editProduct', {product, productId, categories,genre, message: "",formattedReleasedDate })
}


// productManagementController.handleEditData = async (req, res) => {
//   const productId = req.params.id;
//   const {
//     productName,
//     productCategory,
//     publisher,
//     totalQuantity,
//     description,
//     releasedDate,
//     price,
//   } = req.body;

//   let categories = await category.find();
//   let product = await productSchema.findById(productId);

//   const capitalizedProductName = productName
//     .toLowerCase()
//     .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());

//   try {
//     const existingProduct = await productSchema.findOne({
//       $or: [
//         { productName: capitalizedProductName },
//         { productName: capitalizedProductName.trim() },
//       ],
//     });

//     if (existingProduct && existingProduct._id != productId) {
//       return res.render("Admin/editProduct", {
//         categories,
//         product,
//         message: "Product name already exists",
//         productId,
//         formattedReleasedDate: "",
//       });
//     }

//     let gameImages = [];
//     let existingImages = [];

//     for (let i = 1; i <= 4; i++) {
//       const fileKey = `gameImages${i}`;
//       if (req.files[fileKey] && req.files[fileKey].length > 0) {
//         gameImages[i - 1] = `/productimgs/${req.files[fileKey][0].filename}`;
//         existingImages.push(product.image[i - 1]);

//       } else {
//         gameImages[i - 1] = product.image[i - 1];
//       }
//     }
    
//     const updatedProduct = await productSchema.findByIdAndUpdate(
//       productId,
//       {
//         productName: capitalizedProductName,
//         productCategory,
//         publisher,
//         size: req.body.convertedSize,
//         totalQuantity,
//         description,
//         releasedDate,
//         price,
//         image: gameImages,
//       },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).send('Product not found');
//     }

//     existingImages.forEach((existingImagePath) => {
//       const fullPath = path.join('D:\\First Project\\public', existingImagePath);
    
//       try {
//         if (fs.existsSync(fullPath)) {
//           fs.unlinkSync(fullPath);
//           console.log(`Deleted file: ${fullPath}`);
//         } else {
//           console.log(`File not found: ${fullPath}`);
//         }
//       } catch (err) {
//         console.error(`Error deleting file: ${fullPath}`, err);
//       }
//     });
//     res.redirect('/product-management?update=Successfully%20Edited%20Product');
//   } catch (err) {
//     console.error("Error during updating product:", err);
//     res.status(500).send('Internal Server Error');
//   }
// };

productManagementController.handleEditData = async (req, res) => {
  const productId = req.params.id;
  const {
    productName,
    productCategory,
    publisher,
    totalQuantity,
    description,
    releasedDate,
    price,
    productGenre
  } = req.body;

  let categories = await category.find();
  const genre = await genres.find()
  let product = await productSchema.findById(productId);

  const capitalizedProductName = productName
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());

  try {
    const existingProduct = await productSchema.findOne({
      $or: [
        { productName: capitalizedProductName },
        { productName: capitalizedProductName.trim() },
      ],
    });

    if (existingProduct && existingProduct._id != productId) {
      return res.render("Admin/editProduct", {
        categories,
        product,
        genre,
        message: "Product name already exists",
        productId,
        formattedReleasedDate: "",
      });
    }

    let gameImages = [];
    let existingImages = [];

    for (let i = 1; i <= 4; i++) {
      const fileKey = `gameImages${i}`;
      if (req.files[fileKey] && req.files[fileKey].length > 0) {
        gameImages[i - 1] = `/productimgs/${req.files[fileKey][0].filename}`;
        existingImages.push(product.image[i - 1]);

      } else {
        gameImages[i - 1] = product.image[i - 1];
      }
    }

    try {
      existingImages.forEach((existingImagePath) => {
        const fullPath = path.join('D:\\First Project\\public', existingImagePath);

        if (typeof existingImagePath === 'string') {
          try {
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log(`Deleted file: ${fullPath}`);
            } else {
              console.log(`File not found: ${fullPath}`);
            }
          } catch (err) {
            console.error(`Error deleting file: ${fullPath}`, err);
          }
        } else {
          console.error('Image path is not a string. Unable to remove image.');
          res.status(400).json({ error: 'Image removal failed. Image path is not a string.' });
        }
      });

      // const updatedProduct = await productSchema.findByIdAndUpdate(
      //   productId,
      //   {
      //     productName: capitalizedProductName,
      //     productCategory,
      //     publisher,
      //     size: req.body.convertedSize,
      //     totalQuantity,
      //     description,
      //     releasedDate,
      //     price,
      //     image: gameImages,
      //   },
      //   { new: true }
      // );
      const updatedProductData = {
        productName: capitalizedProductName,
        productCategory,
        publisher,
        size: req.body.convertedSize,
        totalQuantity,
        description,
        releasedDate,
        price,
        image: gameImages,
      };

      if (productCategory === '657fc26292aaf07d17328e08') {
        updatedProductData.productGenre = productGenre;
    }

      const updatedProduct = await productSchema.findByIdAndUpdate(
        productId,
        updatedProductData,
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
  } catch (err) {
    console.error("Error during updating product:", err);
    res.status(500).send('Internal Server Error');
  }
};

productManagementController.removeImage = async(req,res)=>{
  console.log("Remove image haiiii")
  console.log(req.body)
  const productId = req.body.productId
  const product = await productSchema.findById(productId);
  console.log("product in removeimage",product)
  try {
    console.log("inside try")
    const imageIndexToRemove = parseInt(req.body.imageIndexToRemove);
    console.log("Before 1st if")
    if (!isNaN(imageIndexToRemove) && imageIndexToRemove >= 0 && imageIndexToRemove < product.image.length) {
      const imagePathToRemove = path.join('D:\\First Project\\public', product.image[imageIndexToRemove]);

      console.log("Before second if")
      try {
        await fs.promises.access(imagePathToRemove);
      
        await fs.promises.unlink(imagePathToRemove);
        console.log(`Deleted file: ${imagePathToRemove}`);
      
        product.image[imageIndexToRemove] = '';
      
        await product.save();
      
        res.status(200).json({ message: 'Image removed successfully.' });
        return;
      } catch (err) {
        console.error(`Error removing image: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      
    } else {
      console.log('Invalid image index provided.');
    }

    res.status(400).json({ error: 'Image removal failed. Invalid index or file not found.' });
  } catch (err) {
    console.error('Error removing image:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}





module.exports = productManagementController;
