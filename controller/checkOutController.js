const checkOutController = {}
let User = require("../model/userSchema");
let cart = require("../model/cartSchema")
let cartController = require("../controller/cartController")
let Order = require('../model/orderSchema')
let Product = require('../model/productSchema')
let category = require('../model/categorySchema')
let wallet = require('../model/walletSchema')
let Coupons = require('../model/couponSchema')
const Razorpay = require('razorpay');
const crypto = require("crypto");
require('dotenv').config();
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


checkOutController.showData = async (req, res) => {
    const userId = req.session.userId;

    try {
        
        const user = await User.findById(userId);
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const categories = await category.find()
        const userWallet = await wallet.findOne({userId})
        const coupons = await Coupons.find()
        const order = await Order.findOne({customer:userId})
        const items = userCart.items;
        totalPrice = cartController.calculateTotalPrice(items.filter(item => item.productId.totalQuantity > 0));
        req.session.updatedTotalPrice = totalPrice
        const userAddresses = user.address;
        let availableCoupons = [];
        let isCouponAvailable = false;
    
        for (const coupon of coupons) {

            if (coupon.expiry < new Date()) {
                await Coupons.updateOne({ code: coupon.code }, { $set: { isExpired: true, isActive: false } });
            }

            

            if (coupon.discountType === "First Purchase" && coupon.isActive && !coupon.isExpired){
                if(!order){
                   availableCoupons.push(coupon); 
                }
                
            }else if(coupon.minimumCartAmount <= totalPrice && coupon.isActive && !coupon.isExpired) {
                availableCoupons.push(coupon);
            }
            
        }



            if(req.session.UserLogin){
                res.render('User/checkOutPage', { user, userAddresses, totalPrice, items, categories, errorMessage: '',availableCoupons,isCouponAvailable,userWallet})
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
    

    try {
        const user = await User.findById(userId);
        const categories = await category.find()
        const userAddressToEdit = user.address[addressIndex];
        res.render('User/editAddress', { user, userAddressToEdit, addressIndex,categories });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
};
checkOutController.UpdateAddresss = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex,mobile, houseName, street, city, pincode, state } = req.body;

    try {
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


checkOutController.validateCoupon = async (req, res) => {
    const { couponCode, totalAmount , checkoutTotalInput , discountedTotal , discountedValue, checkoutTotal} = req.body;
    try {

        const userId = req.session.userId;
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const items = userCart.items;

        const totalPrice = cartController.calculateTotalPrice(items.filter(item => item.productId.totalQuantity > 0));
        const coupon = await Coupons.findOne({ code: couponCode });

        if (couponCode === "" || (coupon && coupon.code !== couponCode)) {
            const discountedValue = 0;
            const discountedTotal = 0;
            
            res.status(200).json({
                isEmpty: true,
                message: 'Coupon is valid. Discount applied successfully',
                discountedTotal, discountedValue
            });
        } else if (!coupon) {
            // Coupon not found
            res.status(404).json({ isValid: false, message: 'Coupon not found' });
        } else {
            const discountPercentage = coupon.discountValue;

            // If coupon is valid, apply the discount
            if (!isNaN(discountPercentage) && !isNaN(totalAmount)) {
                const discountValue = (discountPercentage / 100) * totalAmount;
                const checkoutTotal = totalAmount - discountValue;
                req.session.updatedTotalPrice = checkoutTotal;
                    req.session.save();
                res.status(200).json({
                    isValid: true,
                    message: 'Coupon is valid. Discount applied successfully',
                    checkoutTotal, discountValue
                });

                const parsedCheckoutTotalInput = parseFloat(discountedTotal).toFixed(2);

                if (!isNaN(parsedCheckoutTotalInput)) {
                    req.session.updatedTotalPrice = parsedCheckoutTotalInput;
                    req.session.save();
                } else {
                    console.error('Invalid checkoutTotalInput value');
                }

            } else {
                // Invalid discount or total amount
                const discountValue = 0;
                const discountedTotal = 0;
                res.status(200).json({
                    isValid: false,
                    message: 'Coupon is valid. Discount applied successfully',
                    discountedTotal, discountValue
                });
            }
        }
    } catch (error) {
        console.error('Error handling Coupon data:', error);
        res.status(500).json({ isValid: false, message: 'Internal Server Error' });
    }
};



checkOutController.cancelOrder = async(req,res)=>{
    const {totalAmount}=req.body
    req.session.updatedTotalPrice = totalAmount
    res.status(200).json({
        success:true
    });
}




checkOutController.handleData = async (req, res) => {
    try {
      const userId = req.session.userId;
      const { selectedMobile, selectedHouseName, selectedStreet, selectedCity, selectedPincode, selectedState, paymentMethod } = req.body;
      const userCart = await cart.findOne({ userId }).populate('items.productId');
      const items = userCart.items;
      let userWallet = await wallet.findOne({userId})
    const user = await User.findById(userId);
    const userAddresses = user.address;
    const inStockItems = items.filter(item => item.productId.totalQuantity > 0);
    const updatedTotalPrice = req.session.updatedTotalPrice;
    const categories = await category.find()
    const hasItemWithQuantity = items.some(item => item.productId.totalQuantity > 0);

    if (!hasItemWithQuantity) {
      return res.render('User/checkOutPage', { user, userAddresses, totalPrice, items, categories, errorMessage: 'Selected item must be in available' });
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
        userWallet.balance -= updatedTotalPrice;
            userWallet.transactionHistory.push({
                transaction: 'Money Deducted',
                amount: updatedTotalPrice,
            });
    }
    
      
      
    for (const item of inStockItems) {
        const productId = item.productId._id;
        const quantityToReduce = item.quantity;
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
      await cart.findOneAndUpdate({ userId: userId },
        {$set:{items:[]}}
        )
      res.redirect("/order-confirmed");
    } catch (err) {
      console.error('Error handling checkout data:', err);
      res.status(500).send('Internal Server Error');
    }
  }
  

function generateOrderId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
}


checkOutController.createOrder = async(req,res)=>{
    const userId = req.session.userId;
    let { paymentOption, totalAmount, currency,razorpay_order_id, razorpay_signature } = req.body;
    try {
        
        const amount = totalAmount*100
        if(paymentOption==="onlinePayment"){
            const options = {
                amount: totalAmount * 100, // Amount in paise
                currency: currency || 'INR',
                receipt: 'receipt_order_1',
                notes: {},
              };
            const order = await instance.orders.create(options);
            return res.json({order,paymentOption,amount,currency}); 
        }
    } catch (error) {
        console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
    }
}







checkOutController.verifyPayment = async(req,res)=>{
    try {
    const userId = req.session.userId;
      const {payment,order,paymentOption, selectedMobile, selectedHouseName, selectedStreet, selectedCity, selectedPincode, selectedState, paymentMethod } = req.body;
      const userCart = await cart.findOne({ userId }).populate('items.productId');
      const items = userCart.items;
      let userWallet = await wallet.findOne({userId})
    const user = await User.findById(userId);
    const userAddresses = user.address;
    const inStockItems = items.filter(item => item.productId.totalQuantity > 0);
    const updatedTotalPrice = req.session.updatedTotalPrice;
    const categories = await category.find()
    const hasItemWithQuantity = items.some(item => item.productId.totalQuantity > 0);
    const hmac = crypto
      .createHmac("sha256", "KsMsg1hvtW6qUxgdY3BWwPvf")
      .update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
      .digest("hex");
      if(hmac===payment.razorpay_signature){
        const userId = req.session.userId;
        let totalAmount=order.amount
        if (!hasItemWithQuantity) {
            return res.render('User/checkOutPage', { user, userAddresses, totalPrice, items, categories, errorMessage: 'Selected item must be in available' });
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
            paymentMethod: paymentOption,
            orderId: generateOrderId(),
          });
      
          await newOrder.save();
          await cart.findOneAndUpdate({ userId: userId },
            {$set:{items:[]}}
            )
        return res.json({ status: true})
      }


    } catch (error) {
        console.log(error);
    res.status(500).json({ error: "Internal server on verifying" });
    }
}





checkOutController.orderConfirmed = async (req, res) => {
    try {
        const userId = req.session.userId;
        const latestOrder = await Order.findOne({ customer: userId }).sort({ orderDate: -1 }).populate('items.product');
        const user = await User.findById(userId);
        const categories = await category.find()

        console.log("latest order",latestOrder)
        if(req.session.UserLogin){
            res.render('User/orderConfirmed', { categories,latestOrder,userName:user.name , user });
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