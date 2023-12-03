const cart = require('../model/cartSchema')
const cartController = {}
const category = require('../model/categorySchema')
const calculateTotalPrice = (items) => {
    const totalPrice = items.reduce((total, item) => {
        // Check if the item is in stock (totalQuantity > 0)
        if (item.productId.totalQuantity > 0) {
            return total + item.productId.price * item.quantity;
        }
        return total;
    }, 0);

    return totalPrice.toFixed(2);
};

cartController.showCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const categories = await category.find()
        if (userCart) {
            const items = userCart.items;
            userCart.items.forEach(product => {
                console.log("Quantity : ", product.productId.totalQuantity);
            });

            const totalPrice = calculateTotalPrice(items);
            res.render("cart", { items, userId, totalPrice, isEmptyCart: userCart.items.length === 0 , categories});

        } else {
            res.render("cart", { items, userId, totalPrice, isEmptyCart: userCart.items.length === 0 ,categories});

        }
    } catch (err) {
        console.log("Error in showing data", err);
        res.status(500).send("Internal Server Error");
    }
};

cartController.emptyCart = (req,res)=>{
    const userId = req.session.userId;
    res.render("emptyCart",{userId})
}

cartController.removeItem = async (req,res)=>{
    const userId = req.session.userId
    const productIdToRemove = req.params.id
    console.log("product id to remove: ",productIdToRemove)
    console.log("user id to remove product: ",userId)
    try {
        const updatedCart = await cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productIdToRemove } } },
            { new: true })
        res.redirect('/cart')
    } catch (error) {
        console.log("error during removing",error)
        res.status(500).send("Internal server error")
    }
}

// Add this route to handle quantity updates

 
cartController.updateQuantity = async (req, res) => {
    console.log('Update quantity request received');
    const userId = req.session.userId;
    const productId = req.params.productId;
    const newQuantity = req.body.quantity;
    console.log('req.body:', req.body);
    console.log('Fetch Request:', `/cart-update-quantity/${productId}`);
    console.log('req.bosy',req.body)
    try {
        const updatedCart = await cart.findOneAndUpdate(
            { userId, 'items.productId': productId },
            { $set: { 'items.$.quantity': newQuantity } },
            { new: true }
        );

        if (updatedCart) {
            res.status(200).json({ message: 'Quantity updated successfully' });
        } else {
            res.status(404).json({ message: 'Product not found in the cart' });
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    showCart: cartController.showCart,
    removeItem: cartController.removeItem,
    updateQuantity: cartController.updateQuantity,
    calculateTotalPrice: calculateTotalPrice, 
    emptyCart:cartController.emptyCart
};