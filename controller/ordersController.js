const ordersController = {}
let orders = require('../model/orderSchema')
let Product = require('../model/productSchema')
let category = require('../model/categorySchema')
let User = require('../model/userSchema')
let wallet = require('../model/walletSchema')

ordersController.showData = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const categories = await category.find()
        const userOrders = await orders.find({ customer: userId }).populate('items.product');;

        res.render('orders', { userOrders,userId,categories });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).send('Internal Server Error');
    }
}

ordersController.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        

        // Find the order by ID
        const order = await orders.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        let userWallet = await wallet.findOne({userId:order.customer})
        if(!userWallet){
            userWallet = new wallet({
                userId:order.customer,
                balance:0,
                transactionHistory:[]
            })
            await userWallet.save();

        }
        if (order.paymentMethod === 'Wallet') {
            const orderAmount = order.totalAmount
            userWallet.balance += orderAmount;
            userWallet.transactionHistory.push({
                transaction: 'Money Added',
                amount: orderAmount,
            });
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore }
                });
            }
            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
            await userWallet.save();

            return res.redirect('/orders');
        } else {
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore }
                });
            }
            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
            await userWallet.save();

            return res.redirect('/orders');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Internal Server Error');
    }
};

ordersController.returnOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        

        // Find the order by ID
        const order = await orders.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        let userWallet = await wallet.findOne({userId:order.customer})
        if(!userWallet){
            userWallet = new wallet({
                userId:order.customer,
                balance:0,
                transactionHistory:[]
            })
            await userWallet.save();

        }
        if (order.OrderStatus === 'Delivered') {
            const orderAmount = order.totalAmount
            userWallet.balance += orderAmount;
            userWallet.transactionHistory.push({
                transaction: 'Money Added',
                amount: orderAmount,
            });
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore }
                });
            }
            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Returned' });
            await userWallet.save();

            return res.redirect('/orders');
        } else {
            return res.status(400).send('Invalid order status for return');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Internal Server Error');
    }
};

ordersController.orderDetails = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const categories = await category.find()
        const orderId = req.params.orderId
        const orderDetails = await orders.findOne({ _id: orderId }).populate('items.product');
        const customer = await User.findById(userId)
        res.render('orderDetails', { orderDetails,userId,categories,customer });

    } catch (error) {
        
    }
    
}

module.exports = ordersController