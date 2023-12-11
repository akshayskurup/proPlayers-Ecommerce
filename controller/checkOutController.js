const checkOutController = {}
let User = require("../model/userSchema");
let cart = require("../model/cartSchema")
let cartController = require("../controller/cartController")
let Order = require('../model/orderSchema')
let Product = require('../model/productSchema')
let category = require('../model/categorySchema')




checkOutController.showData = async (req, res) => {
    const userId = req.session.userId;
    console.log("user id:", userId);

    try {

        const user = await User.findById(userId);
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const categories = await category.find()
        const items = userCart.items;
        console.log("caart items",items)
        const totalPrice = cartController.calculateTotalPrice(items.filter(item => item.productId.totalQuantity > 0));
        const userAddresses = user.address;
        if(req.session.UserLogin){
            res.render("checkOutPage", { user, userAddresses, totalPrice,items,categories,errorMessage:""});

        }
        else{
            res.redirect('/')
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
};


checkOutController.editAddress = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex } = req.body;
    console.log("addressIndex",addressIndex)
    

    try {
        const user = await User.findById(userId);
        const categories = await category.find()
        const userAddressToEdit = user.address[addressIndex];
        res.render('editAddress', { user, userAddressToEdit, addressIndex,categories });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
};
checkOutController.UpdateAddresss = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex,mobile, houseName, street, city, pincode, state } = req.body;
    console.log("addressIndex",addressIndex)

    try {
        console.log("workingg........")
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    [`address.${addressIndex}.mobile`]: mobile,
                    [`address.${addressIndex}.houseName`]: houseName,
                    [`address.${addressIndex}.street`]: street,
                    [`address.${addressIndex}.city`]: city,
                    [`address.${addressIndex}.pincode`]: pincode,
                    [`address.${addressIndex}.state`]: state
                    
                },
            },
            { new: true }
        );

        
        res.redirect("/checkOut");
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Internal Server Error');
    }
}

checkOutController.handleData = async (req, res) => {
    try {
      const userId = req.session.userId;
      const { selectedMobile, selectedHouseName, selectedStreet, selectedCity, selectedPincode, selectedState, paymentMethod } = req.body;
      const userCart = await cart.findOne({ userId }).populate('items.productId');
      const items = userCart.items;

      
    const user = await User.findById(userId);
    const userAddresses = user.address;
    const inStockItems = items.filter(item => item.productId.totalQuantity > 0);
    const totalPrice = cartController.calculateTotalPrice(inStockItems);
    const categories = await category.find()
    const hasItemWithQuantity = items.some(item => item.productId.totalQuantity > 0);

    if (!hasItemWithQuantity) {
      return res.render('checkOutPage', { user, userAddresses, totalPrice, items, categories, errorMessage: 'Selected item must be in available' });
    }

      
      
    for (const item of inStockItems) {
        const productId = item.productId._id;
        const quantityToReduce = item.quantity;
  
        // Update product quantity in the database
        await Product.updateOne({ _id: productId }, { $inc: { totalQuantity: -quantityToReduce } });
      }
      const newOrder = new Order({
        customer: userId,
        address: {
          mobile: selectedMobile,
          houseName: selectedHouseName,
          street: selectedStreet,
          city: selectedCity,
          pincode: selectedPincode,
          state: selectedState,
        },
        items: items
        .filter(item => item.productId.totalQuantity > 0)
        .map(item => ({
          product: item.productId._id,
          quantity: item.quantity
        })),
        totalAmount: totalPrice,
        OrderStatus: 'Order Placed',
        paymentMethod: paymentMethod,
        orderId: generateOrderId(),
      });
  
      await newOrder.save();
      res.redirect("/order-confirmed");
    } catch (err) {
      console.error('Error handling checkout data:', err);
      res.status(500).send('Internal Server Error');
    }
  }
  

function generateOrderId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
}

checkOutController.orderConfirmed = async (req, res) => {
    try {
        // Fetch the latest order for the current user
        const userId = req.session.userId;
        const latestOrder = await Order.findOne({ customer: userId }).sort({ orderDate: -1 }).populate('items.product');
        const user = await User.findById(userId);

        console.log("latest order",latestOrder)
        // Render the 'orderConfirmed' view with the latest order details
        if(req.session.UserLogin){
            res.render('orderConfirmed', { latestOrder,userName:user.name , user });
        }
        else{
            res.redirect('/')
        }
        
    } catch (err) {
        console.error('Error fetching latest order:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = checkOutController


