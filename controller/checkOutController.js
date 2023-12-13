const checkOutController = {}
let User = require("../model/userSchema");
let cart = require("../model/cartSchema")
let cartController = require("../controller/cartController")
let Order = require('../model/orderSchema')
let Product = require('../model/productSchema')
let category = require('../model/categorySchema')
let wallet = require('../model/walletSchema')
let Coupons = require('../model/couponSchema')


checkOutController.showData = async (req, res) => {
    const userId = req.session.userId;
    console.log("user id:", userId);

    try {
        
        const user = await User.findById(userId);
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const categories = await category.find()
        const userWallet = await wallet.findOne({userId})
        const coupons = await Coupons.find()
        const order = await Order.findOne({customer:userId})
        const items = userCart.items;
        console.log("caart items",items)
        totalPrice = cartController.calculateTotalPrice(items.filter(item => item.productId.totalQuantity > 0));
        req.session.updatedTotalPrice = totalPrice
        console.log("req.session in checkOut",req.session.updatedTotalPrice)
        const userAddresses = user.address;
        let availableCoupons = [];
        let isCouponAvailable = false;
    
        console.log("before checking")
        for (const coupon of coupons) {

            if (coupon.expiry < new Date()) {
                await Coupons.updateOne({ code: coupon.code }, { $set: { isExpired: true, isActive: false } });
            }

            console.log(" checking2");

            if (coupon.discountType === "First Purchase" && coupon.isActive && !coupon.isExpired){
                if(!order){
                   availableCoupons.push(coupon); 
                }
                
            }else if(coupon.minimumCartAmount <= totalPrice && coupon.isActive && !coupon.isExpired) {
                availableCoupons.push(coupon);
            }
            
        }

        console.log("Coupon available", availableCoupons);


            if(req.session.UserLogin){
                res.render('checkOutPage', { user, userAddresses, totalPrice, items, categories, errorMessage: '',availableCoupons,isCouponAvailable,userWallet})
                return;
            }
            else{
                res.redirect('/')
                return;
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


checkOutController.validateCoupon = async(req,res)=>{
    const {couponCode, totalAmount,discountedTotal} = req.body
        try {
            console.log('Session in validateCoupon:', req.session);
            console.log("checkoutTotalInput",discountedTotal)
            const userId = req.session.userId
            const userCart = await cart.findOne({ userId }).populate('items.productId');
            const items = userCart.items;

            const totalPrice = cartController.calculateTotalPrice(items.filter(item => item.productId.totalQuantity > 0));
            const coupon = await Coupons.findOne({ code: couponCode });
            console.log("total Price before",totalPrice)
            if (!coupon) {
                // Coupon not found
                res.status(404).json({ isValid: false, message: 'Coupon not found' });
                return;
            }
            const discountPercentage = coupon.discountValue
            // If coupon is valid, apply the discount
            if (!isNaN(discountPercentage) && !isNaN(totalAmount)) {
                const discountValue = (discountPercentage / 100) * totalAmount;
                const discountedTotal = totalAmount - discountValue;
    
                res.status(200).json({
                    isValid: true,
                    message: 'Coupon is valid. Discount applied successfully',
                    discountedTotal,discountValue
                });
                const parsedCheckoutTotalInput = parseFloat(discountedTotal).toFixed(2);
                console.log("after parsed",parsedCheckoutTotalInput)
            if (!isNaN(parsedCheckoutTotalInput)) {
                req.session.updatedTotalPrice = parsedCheckoutTotalInput;
                req.session.save(); 
                console.log("total Price after", req.session.updatedTotalPrice);
            } else {
                console.error('Invalid checkoutTotalInput value');
            }  //checkOut total after discount saved to the totalprice
                console.log("total Price after",totalPrice)
            } else {
                // Invalid discount or total amount
                res.status(400).json({ isValid: false, message: 'Invalid discount percentage or total amount' });
            }
        }
         catch (error) {
            console.error('Error handling Coupon data:', error);
            res.status(500).json({ isValid: false, message: 'Internal Server Error' });
        }
}




checkOutController.handleData = async (req, res) => {
    try {
      const userId = req.session.userId;
      const { selectedMobile, selectedHouseName, selectedStreet, selectedCity, selectedPincode, selectedState, paymentMethod } = req.body;
      const userCart = await cart.findOne({ userId }).populate('items.productId');
      const items = userCart.items;
      const userWallet = await wallet.findOne({userId})
      console.log("req.session",req.session.updatedTotalPrice)
    const user = await User.findById(userId);
    const userAddresses = user.address;
    const inStockItems = items.filter(item => item.productId.totalQuantity > 0);
    const updatedTotalPrice = req.session.updatedTotalPrice;
    console.log("handle updatePrice",updatedTotalPrice)
    const categories = await category.find()
    const hasItemWithQuantity = items.some(item => item.productId.totalQuantity > 0);

    if (!hasItemWithQuantity) {
      return res.render('checkOutPage', { user, userAddresses, totalPrice, items, categories, errorMessage: 'Selected item must be in available' });
    }
    
    if(!userWallet){
        userWallet = new wallet({
            userId:user._id,
            balance:0,
            transactionHistory:[]
        })
        await userWallet.save();
    }

    if (paymentMethod === "Wallet") {
        console.log("In payment Method");
        userWallet.balance -= updatedTotalPrice;
            userWallet.transactionHistory.push({
                transaction: 'Money Deducted',
                amount: updatedTotalPrice,
            });
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
        totalAmount: updatedTotalPrice,
        OrderStatus: 'Order Placed',
        paymentMethod: paymentMethod,
        orderId: generateOrderId(),
      });
  
      await newOrder.save();
      await userWallet.save()
      res.redirect("/order-confirmed");
    } catch (err) {
      console.error('Error handling checkout data:', err);
      res.status(500).send('Internal Server Error');
    }
  }
  

function generateOrderId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
}




// checkOutController.updateTotal = async(req,res)=>{
//     try {
//         const { discountedTotal } = req.body;

//   // Process the discounted total as needed
//   console.log('Received discounted total:', discountedTotal);

//   // Send a response back to the client
//   res.json({ message: 'Discounted total received successfully' });
//     } catch (error) {
//         console.error('Error handling Coupon data:', error);
//         res.status(500).json({ isValid: false, message: 'Internal Server Error' });
//     }
// }



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


