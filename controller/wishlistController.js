const wishlistController = {}
const wishlist = require('../model/wislistSchema')
const category = require('../model/categorySchema')
const Cart = require('../model/cartSchema')

// wishlistController.showWishlist = async (req, res) => {
//     try {
//         const userId = req.session.userId;

//         if (!userId) {
//             return res.redirect('/');
//         }
//         const categories = await category.find()

//         const userWishlist = await wishlist.findOne({ userID: userId }).populate('items');
//         if (!userWishlist) {
//             userWishlist = new wishlist({ userID: userId });
//             await userWishlist.save();
//         }
//         const items = userWishlist.items || [];
//         res.render('User/wishlist',{items,categories})
//         console.log("items",items)
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

wishlistController.showWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/');
    }
    const categories = await category.find();

    const userWishlist = await wishlist.findOne({ userID: userId }).populate('items');
    if (!userWishlist) {
      addWishlist = new wishlist({ userID: userId });
      await addWishlist.save();
    }
    const items = userWishlist.items?userWishlist.items:[];

    // Fetch the cart items for the user
    const cartItems = await Cart.find({ userId: userId });

    // Add a property 'isInCart' to each wishlist item based on whether it's in the cart
    items.forEach(item => {
      item.isInCart = cartItems.some(cartItem => cartItem.items.some(cartProduct => cartProduct.productId.equals(item._id)));
    });

    res.render('User/wishlist', { items, categories });
    console.log("items", items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


wishlistController.moveToCart = async (req, res) => {
  try {
      const userId = req.session.userId;
      const productIdToMove = req.params.id;

      const userWishlist = await wishlist.findOne({ userID: userId });
      const cartItem = userWishlist.items.find(item => item.toString() === productIdToMove);

      if (!cartItem) {
          return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
      }

      const isItemInCart = await Cart.exists({
          userId: userId,
          'items.productId': productIdToMove
      });

      userWishlist.items.pull(productIdToMove);
      await userWishlist.save();

      // Add the item to the cart
      const updatedCart = await Cart.findOneAndUpdate(
          { userId: userId },
          { $push: { items: { productId: productIdToMove, quantity: 1 } } },
          { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Item moved to cart successfully', isItemInCart });
  } catch (error) {
      console.error('Error during moving to cart:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


wishlistController.remove = async(req,res)=>{
    try {
        const userId = req.session.userId;
        console.log("userID",userId)
        
        const productIdToRemove = req.params.id;
        console.log("userID2",productIdToRemove)
        const updatedCart = await wishlist.findOneAndUpdate(
            { userID: userId },
            { $pull: { items: productIdToRemove} },
            { new: true })
if (updatedCart) {
res.json({ success: true, message: 'Item removed successfully' });
} else {
res.status(404).json({ success: false, message: 'Cart or item not found' });
}
    } catch (error) {
        console.error('Error during removing:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = wishlistController