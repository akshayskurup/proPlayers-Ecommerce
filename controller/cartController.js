const cart = require('../model/cartSchema')
const cartController = {}

cartController.showCart = async (req,res)=>{
    try{
        const userId = req.session.userId
        const userCart = await cart.findOne({userId}).populate('items.productId')
        const items = userCart.items
        console.log("items:",items)
        if(userCart){
            res.render("cart",{items,userId})
        }
        else{
            res.render('cart',{items,userId})
        }
    }
    catch(err){

    }
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

module.exports = cartController