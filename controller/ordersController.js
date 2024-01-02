const ordersController = {}
let orders = require('../model/orderSchema')
let Product = require('../model/productSchema')
let category = require('../model/categorySchema')
let User = require('../model/userSchema')
let wallet = require('../model/walletSchema')
const pdfController = require('./pdfController');
const { createInvoice } = require('../controller/pdfController');
const path = require('path');
const fs = require('fs');

const ITEMS_PER_PAGE = 7;
ordersController.showData = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const categories = await category.find()
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const totalOrdersCount = await orders.countDocuments({ customer: userId });

        const userOrders = await orders.find({ customer: userId }).populate('items.product').skip(skip).limit(ITEMS_PER_PAGE);
        const totalPages = Math.ceil(totalOrdersCount / ITEMS_PER_PAGE);
        


        res.render('User/orders', { userOrders, userId, categories, currentPage: page, totalPages });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).send('Internal Server Error');
    }
}







ordersController.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        let userWallet = await wallet.findOne({ userId: order.customer });
        if (!userWallet) {
            userWallet = new wallet({
                userId: order.customer,
                balance: 0,
                transactionHistory: [],
            });
            await userWallet.save();
        }

        if (order.paymentMethod === 'Wallet' || order.paymentMethod === 'onlinePayment') {
            const orderAmount = order.totalAmount;
            userWallet.balance += orderAmount;
            userWallet.transactionHistory.push({
                transaction: 'Money Added',
                amount: orderAmount,
            });

            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore },
                });
            }

            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
            await userWallet.save();

            return res.json({ success: true, message: 'Order cancelled successfully' });
        } else {
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore },
                });
            }

            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
            await userWallet.save();

            return res.json({ success: true, message: 'Order cancelled successfully' });
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

ordersController.returnOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orders.findById(orderId);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        if (order.OrderStatus === 'Delivered') {
            const currentDate = new Date();
            const twoDaysAfterDelivery = new Date(order.deliveredAt);
            twoDaysAfterDelivery.setDate(twoDaysAfterDelivery.getDate() + 2);
            console.log("Inside the return controller1")

            if (currentDate.getTime() <= twoDaysAfterDelivery.getTime()) {
                console.log("Inside the return controller2")

                const userWallet = await wallet.findOne({ userId: order.customer });

                if (!userWallet) {
                    userWallet = new wallet({
                        userId: order.customer,
                        balance: 0,
                        transactionHistory: [],
                    });
                    await userWallet.save();
                }

                const orderAmount = order.totalAmount;
                userWallet.balance += orderAmount;
                userWallet.transactionHistory.push({
                    transaction: 'Money Added',
                    amount: orderAmount,
                });

                for (const item of order.items) {
                    const productId = item.product._id;
                    const quantityToRestore = item.quantity;
                    await Product.findByIdAndUpdate(productId, {
                        $inc: { totalQuantity: quantityToRestore },
                    });
                }

                await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Returned' });
                await userWallet.save();

                return res.json({ success: true });
            } else {
                console.log("Inside the return controller3")

                return res.status(400).send('Return not allowed after two days of delivery');
            }
        } else {
            return res.status(400).send('Invalid order status for return');
        }
    } catch (error) {
        console.error('Error returning order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


ordersController.orderDetails = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const categories = await category.find()
        const orderId = req.params.orderId
        const orderDetails = await orders.findOne({ _id: orderId }).populate('items.product');
        const customer = await User.findById(userId)
        res.render('User/orderDetails', { orderDetails,userId,categories,customer });

    } catch (error) {
        
    }
    
}







module.exports = ordersController