let editProductController = {}
const products = require('../model/productSchema')
const category = require('../model/categorySchema')
const SubCategory = require('../model/subCategorySchema')

editProductController.showForm = async (req, res) => {
    const productId = req.params.id
    const product = await products.findById(productId);
    const categories = await category.find()
    const subCategories = await SubCategory.find()
    res.render('editProduct', {product, productId, categories, subCategories, message: "" })
}

editProductController.handleData = async (req, res) => {
    const productId = req.params.id;
    const {
        productName, productCategory, subCategory, publisher, size,
        totalQuantity, description, releasedDate, price, image
    } = req.body;

    let categories = await category.find();
    let subCategories = await SubCategory.find();
    let product = await products.find();

    try {
        const existingProduct = await products.findOne({ productName });

        if (existingProduct) {
            return res.render("editProduct", { categories, subCategories, product, message: "Product already exists",productId});
        }

        const updatedProduct = await products.findByIdAndUpdate(productId, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }

        res.redirect('/product-management');
    } catch (err) {
        console.error("Error during updating product:", err);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = editProductController;
