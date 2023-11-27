let editProductController = {}
const products = require('../model/productSchema')
const category = require('../model/categorySchema')



editProductController.showForm = async (req, res) => {
    const productId = req.params.id
    const product = await products.findById(productId);
    const categories = await category.find()
    const formattedReleasedDate = product.releasedDate.toISOString().split('T')[0];
    res.render('editProduct', {product, productId, categories, message: "",formattedReleasedDate })
}

editProductController.handleData = async (req, res) => {
    const productId = req.params.id;
    const {
        productName, productCategory, publisher, size,
        totalQuantity, description, releasedDate, price, image
    } = req.body;

    let categories = await category.find();
    let product = await products.find();

    try {
        const existingProduct = await products.findOne({ productName });

        if (existingProduct) {
            return res.render("editProduct", { categories, product, message: "Product already exists",productId});
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
