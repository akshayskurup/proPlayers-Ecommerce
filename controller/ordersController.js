const ordersController = {}
let orders = require('../model/orderSchema')

ordersController.showData = async (req,res)=>{
    try {
        const userId = req.session.userId;

        // Fetch orders for the logged-in user
        const userOrders = await orders.find({ customer: userId }).populate('items.product');;

        res.render('orders', { userOrders,userId });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).send('Internal Server Error');
    }
}

ordersController.cancelOrder = async (req,res)=>{
    try {
        const orderId = req.params.orderId;
        console.log("order id",orderId)
        // Update the order status to 'cancelled' in the database
        await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });

        // Redirect back to the orders page
        res.redirect('/orders');
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = ordersController